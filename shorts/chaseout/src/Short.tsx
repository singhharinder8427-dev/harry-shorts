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
/** a sine near frequency f (rad/s) snapped to whole cycles over the video, so it loops */
const lsin = (t: number, f: number, ph = 0) => Math.sin(2 * Math.PI * Math.round(f * DURATION / (2 * Math.PI)) * t / DURATION + ph);

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
const OfficeDesk: React.FC<{z: number; side: number; stuff?: boolean; photo?: boolean; hue?: string; empty?: boolean; take?: number; taken?: number; flag?: boolean; chair?: boolean}> = ({z, side, stuff = true, photo = false, hue, empty = false, take = 0, taken = 0, flag = false, chair = true}) => {
  const x = side * 1.7, gone = (i: number) => clamp(take * 5 - i);         // take: items slide away one by one
  return (<group>
    <Box pos={[x, 0.7, z]} size={[0.75, 0.04, 1.35]} color={DESK} map={tex('speckle', [2, 3], 3)} rough={0.6} />
    {[-1, 1].map((e) => <Box key={e} pos={[x, 0, z + e * 0.62]} size={[0.7, 0.7, 0.04]} color="#B8BDC4" />)}
    <Box pos={[x + side * 0.36, 0.72, z]} size={[0.04, 0.36, 1.35]} color="#7E93A8" map={tex('speckle', [2, 2], 9)} />
    {!empty && taken < 1 && <group position={[x + side * 0.16 + side * 1.4 * gone(0), 0.72, z]}><Monitor pos={[0, 0, 0]} face={-side * Math.PI / 2} hue={hue} /></group>}
    {stuff && !empty && taken < 2 && <>
      <group position={[side * 1.4 * gone(1), 0, 0]}><Box pos={[x - side * 0.08, 0.72, z - 0.42]} size={[0.24, 0.05, 0.32]} color="#E2A93B" rot={[0, 0.2, 0]} /><Box pos={[x - side * 0.08, 0.77, z - 0.42]} size={[0.24, 0.04, 0.32]} color="#4E9BD6" rot={[0, 0.05, 0]} /></group>
      <group position={[side * 1.4 * gone(2), 0, 0]}><Mug pos={[x - side * 0.1, 0.72, z + 0.44]} color={side > 0 ? '#E5484D' : '#F4F1EA'} /></group>
      <group position={[side * 1.4 * gone(3), 0, 0]}><Box pos={[x - side * 0.2, 0.72, z + 0.05]} size={[0.16, 0.015, 0.42]} color="#3A3F48" /></group>
    </>}
    {photo && <group position={[x + side * 0.12, 0.72, z + 0.42]} rotation={[0, -side * 1.15, 0]}>
      <Box size={[0.2, 0.25, 0.02]} color="#8B5E3C" rough={0.5} />
      <mesh position={[0, 0.125, 0.012]}><planeGeometry args={[0.16, 0.2]} /><meshStandardMaterial map={familyPic()} roughness={0.7} /></mesh>
      <Box pos={[0, 0, -0.04]} rot={[-0.4, 0, 0]} size={[0.04, 0.16, 0.01]} color="#8B5E3C" />
    </group>}
    {flag && <group position={[x - side * 0.22, 0.72, z - 0.15]}><Cyl r={0.03} h={0.02} color="#2B2F36" /><Cyl r={0.005} h={0.26} color="#8C8F96" />
      <Box pos={[0.065, 0.17, 0]} size={[0.13, 0.085, 0.004]} r={0} color="#FFFFFF" />
      <Cyl pos={[0.065, 0.2125, 0.002]} rot={[Math.PI / 2, 0, 0]} r={0.022} h={0.004} color="#D62828" cast={false} /></group>}
    {chair && <OfficeChair pos={[side * 0.95, 0, z]} side={side} />}
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
/** the grey door's wall: z = -10 (the office's back wall = the room's front wall), doorway x -0.48..0.48 */
const DoorWall: React.FC<{open: number; color?: string; clock?: number; t: number}> = ({open, color = '#E9DECB', clock, t}) => (<>
  <Box pos={[-2.3, 0, -10.1]} size={[3.64, 3.1, 0.2]} color={color} map={tex('speckle', [6, 3], 6)} cast={false} />
  <Box pos={[2.3, 0, -10.1]} size={[3.64, 3.1, 0.2]} color={color} map={tex('speckle', [6, 3], 6)} cast={false} />
  <Box pos={[0, 2.1, -10.1]} size={[0.96, 1.0, 0.2]} color={color} cast={false} />
  {[-0.53, 0.53].map((x) => <Box key={x} pos={[x, 0, -9.98]} size={[0.08, 2.14, 0.06]} color="#6F777E" cast={false} />)}
  <Box pos={[0, 2.1, -9.98]} size={[1.14, 0.08, 0.06]} color="#6F777E" cast={false} />
  <Door open={open} />
  {clock !== undefined && <Clock pos={[0, 2.6, -9.96]} hours={clock} sec={tick(t)} r={0.2} />}
</>);

// ---------------------------------------------------------------- the office (warm, busy): desk rows at z 1.5, -1.5, -4.5; an open area by the grey door
const Office: React.FC<{t: number; stranger?: boolean; taken?: number; door?: number; clock?: number; room?: React.ReactNode; flag?: boolean}> = ({t, stranger, taken = 0, door = 0, clock, room, flag}) => (<>
  <Ground size={[8.2, 22.4]} at={[0, 1.1]} color="#5E7184" map={tex('speckle', [24, 64], 2)} rough={0.95} />
  <Ground size={[1.0, 22.4]} at={[0, 1.1]} y={0.004} color="#6E8296" map={tex('speckle', [3, 64], 8)} />
  <Box pos={[-4.1, 0, 1.1]} size={[0.2, 3.1, 22.4]} color="#EFE6D6" cast={false} />
  {[-8, -4.6, -1.2, 2.2, 5.6, 9.0].map((z, i) => <group key={i}><Box pos={[-3.99, 0.95, z]} size={[0.03, 1.55, 2.6]} r={0.005} color="#DDEFFF" emissive="#DDEFFF" glow={0.9} cast={false} />
    {[-0.65, 0.65].map((d) => <Box key={d} pos={[-3.97, 0.95, z + d]} size={[0.04, 1.55, 0.06]} color="#F6F2EA" cast={false} />)}</group>)}
  <Box pos={[4.1, 0, 1.1]} size={[0.2, 3.1, 22.4]} color="#EBDFC9" map={tex('speckle', [6, 3], 4)} cast={false} />
  <DoorWall open={door} clock={clock} t={t} />
  <Box pos={[0, 3.05, 1.1]} size={[8.4, 0.1, 22.4]} color="#F4F1EA" cast={false} receive={false} />
  {[-7.5, -4.5, -1.5, 1.5, 4.5, 7.5, 10.5].map((z) => [-1.7, 1.7].map((x) => <Box key={x + '' + z} pos={[x, 3.0, z]} size={[1.1, 0.03, 0.5]} r={0.005} color="#FFFDF5" emissive="#FFFDF5" glow={1} cast={false} receive={false} />))}
  {[1.5, -1.5, -4.5].map((z, i) => [-1, 1].map((side) =>
    <OfficeDesk key={i + '' + side} z={z} side={side} hue={['#9FD3F5', '#BDE7C4', '#F6D58E'][(i + (side > 0 ? 1 : 0)) % 3]}
      photo={stranger && i === 0 && side > 0} taken={i === 1 && side < 0 ? taken : 0} flag={flag && i === 1 && side < 0} />))}
  <Plant pos={[-1.4, 0, -9.4]} s={1.3} t={t} /><Plant pos={[1.9, 0, -9.4]} s={1.2} t={t} /><Plant pos={[3.5, 0, 4.6]} s={1.2} t={t} />
  <Box pos={[-3.45, 0, -7.4]} size={[0.7, 0.85, 0.55]} color="#D8D8D4" map={tex('panels', [1, 1], 3)} /><Box pos={[-3.45, 0.85, -7.4]} size={[0.6, 0.18, 0.45]} color="#BFC3C7" />
  <Box pos={[2.2, 0, -6.9]} size={[0.34, 1.0, 0.34]} color="#F2F2EE" /><Cyl pos={[2.2, 1.0, -6.9]} r={0.15} h={0.42} color="#8FC9F0" opacity={0.75} rough={0.2} />
  {room}
</>);
/** co-workers seated at their office desks, facing their monitors (`stare` turns them to look) */
type CoW = {at: V3; side: number; o: number};
const SEATED: CoW[] = [{at: [-0.95, 0, 1.5], side: -1, o: 1}, {at: [-0.95, 0, -1.5], side: -1, o: 0}, {at: [0.95, 0, -1.5], side: 1, o: 3}, {at: [-0.95, 0, -4.5], side: -1, o: 3}, {at: [0.95, 0, -4.5], side: 1, o: 1}];
const Seated: React.FC<{t: number; w: CoW; i: number; look?: number; pose?: Partial<PersonPose>}> = ({t, w, i, look = 0, pose = {}}) => {
  const ty = lsin(t, 19, i * 2) * 5;
  return (<Cel at={w.at} h={1.66}>
    <Person id={'co' + i} outfit={CO[w.o]} view={look ? 'front' : w.side > 0 ? 'right' : 'left'} {...seat(look ? w.side * 0.6 : w.side)} handL={look ? [-74, -128] : [w.side * 104, -192 + (w.side < 0 ? ty : -ty)]} handR={look ? [74, -128] : [w.side * 112, -188 + (w.side > 0 ? ty : -ty)]}
      faceDx={look ? look * 26 : 0} lookX={look ? look * 8 : 0} eyes="dot" mouth="smile" blink={bump((t + i * 0.7) % (DURATION / 12), 1, 1.15)} {...pose} />
  </Cel>);
};

// ---------------------------------------------------------------- the tiny room: x -3..3, z -16..-10. Ken's bare desk on the left wall, Taro's desk on the right wall
const KCH: V3 = [-1.45, 0, -13.0], TCH: V3 = [1.45, 0, -14.4];
const CLOCK: V3 = [0, 2.1, -15.93], CAL: V3 = [-1.5, 1.72, -15.93];
const RoomDesk: React.FC<{x: number; z: number; side: number; drawer?: number; clutter?: number; dust?: boolean}> = ({x, z, side, drawer = 0, clutter = 0, dust}) => (<group>
  <Box pos={[x, 0.7, z]} size={[0.72, 0.04, 1.25]} color="#CFC8BA" map={tex('speckle', [2, 3], 21)} rough={0.7} />
  <Box pos={[x, 0, z - 0.58]} size={[0.68, 0.7, 0.04]} color="#9CA39C" />
  {/* drawer pedestal on the near end (+z), the drawer slides out toward the chair */}
  <Box pos={[x, 0, z + 0.4]} size={[0.66, 0.7, 0.42]} color="#A9B0A8" map={tex('panels', [1, 2], 7)} />
  <group position={[-side * 0.42 * drawer, 0, 0]}><Box pos={[x - side * 0.35, 0.4, z + 0.4]} size={[0.06, 0.22, 0.38]} color="#B7BEB6" /><Box pos={[x - side * 0.385, 0.5, z + 0.4]} size={[0.02, 0.03, 0.12]} color="#4A4F55" />
    {drawer > 0.02 && <><Box pos={[x - side * 0.1, 0.4, z + 0.4]} size={[0.48, 0.02, 0.36]} color="#5E655D" /><Box pos={[x - side * 0.1, 0.4, z + 0.22]} size={[0.48, 0.18, 0.02]} color="#9AA198" /><Box pos={[x - side * 0.1, 0.4, z + 0.58]} size={[0.48, 0.18, 0.02]} color="#9AA198" /></>}
  </group>
  {dust && <group position={[x + side * 0.1, 0.722, z - 0.1]}>
    <Box size={[0.26, 0.002, 0.6]} r={0} color="#F3EFE6" cast={false} />
    <mesh position={[-side * 0.12, 0.012, -0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.07, 0.009, 6, 24, 5.2]} /><meshStandardMaterial color="#2B2F36" /></mesh>
  </group>}
  {clutter > 0 && <>
    <group position={[x + side * 0.12, 0.72, z - 0.36]}><Cyl r={0.1} rTop={0.12} h={0.16} color="#D9774A" /><Cyl pos={[0, 0.16, 0]} r={0.07} rTop={0.06} h={0.62 * clutter} color="#5BAA5F" map={tex('stripes', [4, 1], 4)} />
      <Cyl pos={[0.09, 0.4, 0]} rot={[0, 0, -0.9]} r={0.035} h={0.16 * clutter} color="#5BAA5F" /><Ball pos={[0, 0.16 + 0.62 * clutter, 0]} r={0.065} color="#5BAA5F" /><Ball pos={[0, 0.2 + 0.62 * clutter, 0]} r={0.03} color="#F08AB0" /></group>
    {Array.from({length: Math.round(16 * clutter)}, (_, i) => <Box key={i} pos={[x + side * 0.08 + (rnd(i) - 0.5) * 0.03, 0.72 + i * 0.035, z + 0.05]} rot={[0, (rnd(i + 9) - 0.5) * 0.4, 0]} size={[0.24, 0.033, 0.32]} r={0}
      color={['#E2A93B', '#4E9BD6', '#E5484D', '#F4F1EA', '#6CB86A'][i % 5]} />)}
    <Mug pos={[x - side * 0.18, 0.72, z + 0.42]} color="#C8433A" />
  </>}
</group>);
const RoomChair: React.FC<{pos: V3; side: number; pushed?: number}> = ({pos, side, pushed = 0}) => (<group position={[pos[0] + side * 0.4 * pushed, 0, pos[2]]}>
  {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z], i) => <Cyl key={i} pos={[x, 0, z]} r={0.018} h={0.44} color="#6B6F73" />)}
  <Box pos={[0, 0.44, 0]} size={[0.44, 0.05, 0.44]} r={0.02} color="#7C8A82" />
  <Box pos={[-side * 0.21, 0.48, 0]} size={[0.04, 0.42, 0.42]} r={0.02} color="#7C8A82" />
</group>);
/** wall calendar: one page per week, the crosses grow; flips = time passing (shapes, no text) */
const Calendar: React.FC<{week: number}> = ({week}) => {
  const w = Math.floor(week), f = week - w, flip = f > 0.75 ? (f - 0.75) / 0.25 : 0;
  const page = (n: number, z: number, rx = 0) => (<group position={[0, 0.24, z]} rotation={[rx, 0, 0]}><group position={[0, -0.24, 0]}>
    <Box size={[0.42, 0.48, 0.006]} r={0} color={['#FFFFFF', '#FFF6E5', '#F2F7FF', '#FFF0F0', '#F4FFF0'][n % 5]} cast={false} />
    <Box pos={[0, 0.4, 0.004]} size={[0.42, 0.08, 0.004]} r={0} color={['#E5484D', '#3F7FD9', '#E2A93B', '#6CB86A', '#9B8BD9'][n % 5]} cast={false} />
    {Array.from({length: 20}, (_, i) => { const cx = -0.16 + (i % 5) * 0.08, cy = 0.31 - Math.floor(i / 5) * 0.075; const crossed = i < 5 + n * 4;
      return <group key={i} position={[cx, cy, 0.005]}>{crossed ? [0.8, -0.8].map((a) => <Box key={a} rot={[0, 0, a]} pos={[0, -0.025, 0]} size={[0.008, 0.05, 0.002]} r={0} color="#C8433A" cast={false} />)
        : <Box pos={[0, -0.018, 0]} size={[0.035, 0.035, 0.002]} r={0} color="#DADDE0" cast={false} />}</group>; })}
  </group></group>);
  return (<group position={CAL}><Box pos={[0, 0.5, 0.01]} size={[0.06, 0.03, 0.02]} color="#6B6F73" />{page(w + 1, 0.004)}{page(w, 0.012, flip * 2.6)}</group>);
};
const Room: React.FC<{t: number; taro?: 'full' | 'cleared'; drawer?: number; clock?: number; beam?: number; pushed?: number; week?: number; front?: boolean; back?: boolean; door?: number}> = ({t, taro = 'full', drawer = 0, clock = 3.7, beam = 0, pushed = 0, week = 0, front = false, back = true, door = 0}) => (<group>
  <Ground size={[6, 6]} at={[0, -13]} y={0.003} color="#A3A89D" map={tex('tiles', [8, 8], 12)} rough={0.8} />
  <Box pos={[-3.1, 0, -13]} size={[0.2, 3.0, 6.2]} color="#B8C1B5" map={tex('speckle', [5, 3], 31)} cast={false} />
  <Box pos={[3.1, 0, -13]} size={[0.2, 3.0, 6.2]} color="#B8C1B5" map={tex('speckle', [5, 3], 32)} cast={false} />
  {back && <><Box pos={[0, 0, -16.1]} size={[6.4, 3.0, 0.2]} color="#B3BCB0" map={tex('speckle', [5, 3], 33)} cast={false} /><Box pos={[0, 0, -16.0]} size={[6.0, 0.12, 0.04]} color="#8E978F" cast={false} />
    <Clock pos={CLOCK} hours={clock} sec={tick(t)} r={0.34} /><Calendar week={week} /><Plant pos={[-2.55, 0, -15.5]} s={0.9} t={t} dead /></>}
  {front && <DoorWall open={door} color="#B8C1B5" t={t} />}
  <Box pos={[0, 2.95, -13]} size={[6.4, 0.1, 6.2]} color="#C9CFC9" cast={false} receive={false} />
  {[-12, -14.5].map((z) => <Box key={z} pos={[0, 2.9, z]} size={[1.1, 0.03, 0.32]} color="#F3FAF7" emissive="#F3FAF7" glow={0.8} cast={false} receive={false} />)}
  {/* high frosted window on the left wall + its sunbeam */}
  <Box pos={[-2.99, 1.85, -14.6]} size={[0.03, 0.7, 1.2]} r={0.005} color="#E9F6FF" emissive="#E9F6FF" glow={0.9} cast={false} />
  {beam > 0.01 && <mesh position={[-1.9, 1.15, -13.4]} rotation={[0.35, 0, -0.75]}><boxGeometry args={[0.6, 3.2, 1.0]} /><meshBasicMaterial color="#FFF1C4" transparent opacity={0.2 * beam} depthWrite={false} /></mesh>}
  <Cyl pos={[2.55, 0, -10.6]} r={0.15} rTop={0.17} h={0.34} color="#6B6F73" />
  <RoomDesk x={-2.2} z={KCH[2]} side={-1} drawer={drawer} dust />
  <RoomDesk x={2.2} z={TCH[2]} side={1} clutter={taro === 'full' ? 1 : 0} />
  <RoomChair pos={KCH} side={-1} /><RoomChair pos={TCH} side={1} pushed={taro === 'cleared' ? 1 : pushed} />
</group>);
/** the phone: screen faces +z of its group; rows = inbox rows still showing (5 -> 0) */
const Phone: React.FC<{pos: V3; rot?: V3; s?: number; rows?: number; dim?: boolean}> = ({pos, rot = [0, 0, 0], s = 1, rows = 0, dim}) => (<group position={pos} rotation={rot} scale={s}>
  <Box pos={[0, -0.075, 0]} size={[0.075, 0.15, 0.012]} r={0.006} color="#1F2328" rough={0.4} />
  <Box pos={[0, -0.069, 0.0062]} size={[0.064, 0.136, 0.001]} r={0} color={dim ? '#20262E' : '#CDE6FA'} emissive={dim ? '#000000' : '#CDE6FA'} glow={dim ? 0 : 0.7} cast={false} />
  {Array.from({length: 5}, (_, i) => { const u = clamp(rows - i); return u <= 0.01 ? null : <group key={i} position={[0, 0.045 - i * 0.025, 0.0072]} scale={[u, u, 1]}>
    <Box pos={[0.006, -0.008, 0]} size={[0.044, 0.016, 0.001]} r={0} color="#FFFFFF" emissive="#FFFFFF" glow={0.3} cast={false} />
    <Cyl pos={[-0.024, 0, 0]} rot={[Math.PI / 2, 0, 0]} r={0.0045} h={0.001} color="#3F7FD9" emissive="#3F7FD9" glow={0.5} cast={false} /></group>; })}
</group>);
const PHONE_HAND: [number, number] = [70, -282];
/** Taro reclining with his feet up, scrolling (dir = which way he faces on screen) */
const TaroCel: React.FC<{t: number; dir: number; asleep?: boolean; wave?: number}> = ({t, dir, asleep, wave = 0}) => {
  const scroll = lsin(t, 5) > 0.6 ? 6 : 0;
  return (<Cel at={TCH} h={1.64}><Taro view={dir > 0 ? 'right' : 'left'} {...feetUp(dir)} handR={dir > 0 ? [PHONE_HAND[0], PHONE_HAND[1] + scroll] : [-40, -250]} handL={dir > 0 ? (wave > 0 ? [-60, -380 - 18 * Math.sin(t * 14) * wave] : [40, -250]) : [-PHONE_HAND[0], PHONE_HAND[1] + scroll]}
    eyes={asleep ? 'closed' : 'dot'} mouth="smile" faceDx={asleep ? 0 : dir * 8} lookY={asleep ? 0 : 7} blink={bump(t % (DURATION / 15), 1.4, 1.55)} headTilt={-4 * dir} /></Cel>);
};
const taroPhone = (cam: Cam3, dir: number, rows = 5, dim = false) => <Phone pos={celPoint(cam, TCH, 1.64, [dir * (PHONE_HAND[0] + 2), PHONE_HAND[1] - 4])} rot={[0.35, -0.6 * dir, 0]} rows={rows} dim={dim} />;

// camera rigs: FRONT = the front wall removed, looking into the room (-z): screen right = +x.  DOORVIEW = the back wall removed, looking at the door (+z): screen right = -x
const FRONT_WIDE: Cam3 = {pos: [0, 1.75, -4.6], look: [0, 1.0, -13.4], fov: 40};
const DOORVIEW: Cam3 = {pos: [0.75, 1.6, -21.2], look: [0.4, 1.05, -11.5], fov: 42};

// ---------------------------------------------------------------- A: frame 0 = last frame - the boss waits by the grey door
const BOSS_DOOR: V3 = [0.95, 0, -9.35];
const CAM0: Cam3 = {pos: [0.3, 1.6, -3.4], look: [0.4, 1.2, -9.6], fov: 38};
const bossWaitPose = (t: number): PersonPose => ({id: 'boss', view: 'front', handL: [-74, -128], handR: [96, -150], mouth: 'grin', eyes: 'dot', headTilt: 5, blink: bump(t % (DURATION / 9), 2.0, 2.15)});
const Opening: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[0, CAM0], [CH(1), {pos: [0.3, 1.58, -4.0], look: [0.42, 1.2, -9.6], fov: 37}]]);
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} />}>
    <Cel at={BOSS_DOOR} h={1.76}><Boss {...bossWaitPose(t)} bounce={4 * spring(t, K.picture + 0.2, 3, 5)} eyes={t > K.picture + 0.2 && t < K.picture + 0.6 ? 'closed' : 'dot'} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- B: walking you past your desk (side tracking shot)
const Walk: React.FC<{t: number}> = ({t}) => {
  const u = prog(t, CH(1), CH(2) + 0.2), z = lerp(2.9, 0.4, u);
  const cam: Cam3 = {pos: [-3.8, 2.05, z], look: [0.3, 1.0, z], fov: 50};
  const wb = walk(u * 6 * Math.PI, true), wk = walk(u * 6 * Math.PI + 1.3, true);
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} />}>
    <Cel at={[0.05, 0, z - 0.55]} h={1.76}><Boss view="left" {...wb} handR={[120, -250]} handL={[-74 - wb.s * 20, -128]} mouth="grin" eyes="closed" /></Cel>
    <Cel at={[0.2, 0, z + 0.55]}><Ken view="left" {...wk} faceDx={46} lookX={10} eyes="dot" mouth="frown" brow={-0.6} handR={[74 + wk.s * 20, -128]} handL={[-74, -128]} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- C / S: the door opens into the bare room (Monday: the same frame, Taro's corner empty)
const DoorShot: React.FC<{t: number; t0: number; t1: number; light?: Light; monday?: boolean}> = ({t, t0, t1, light = ROOM, monday = false}) => {
  const cam = cam3At(t, [[t0, DOORVIEW], [t1, {pos: [0.75, 1.58, -20.5], look: [0.4, 1.05, -11.5], fov: 41}]]);
  const open = 2.85 * smooth(prog(t, t0 + 0.05, t0 + 0.5));
  const inB = smooth(prog(t, t0 + 0.3, t0 + 1.0)), inK = smooth(prog(t, t0 + (monday ? 0.3 : 0.45), t0 + (monday ? 0.95 : 1.15))), look = t > t0 + 1.05;
  return (<World cam={cam} light={light} sky={SKY_ROOM} scene={<><Office t={t} door={open} /><Room t={t} back={false} taro={monday ? 'cleared' : 'full'} /></>}>
    {!monday && <TaroCel t={t} dir={-1} />}
    {!monday && <Cel at={[lerp(0.0, -0.8, inB), 0, lerp(-9.4, -10.9, inB)]} h={1.76}><Boss view={inB < 1 ? 'front' : 'right'} {...walk(inB * 4 * Math.PI, inB > 0 && inB < 1)} handR={inB >= 1 ? [150, -250] : [74, -128]} mouth="grin" eyes="closed" /></Cel>}
    <Cel at={[lerp(0.0, monday ? 0.0 : 0.45, inK), 0, lerp(-9.2, -11.1, inK)]}><Ken view="front" {...walk(inK * 4 * Math.PI, inK > 0 && inK < 1)} handR={monday ? [70, -200] : [74, -128]}
      eyes={look && !monday ? 'wide' : 'dot'} mouth={monday ? 'smile' : look ? 'flat' : 'frown'} faceDx={look && !monday ? 24 * Math.sin((t - t0) * 2.6) : 0} lookX={look && !monday ? 7 * Math.sin((t - t0) * 2.6) : 0} browUp={look && !monday ? 0.8 : 0} /></Cel>
  </World>);
};
const kenMug = (cam: Cam3, at: V3) => <Mug pos={celPoint(cam, at, 1.7, [72, -196])} />;

// ---------------------------------------------------------------- D: no computer, no work (Ken at his bare desk)
const BareDesk: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(3), {pos: [-0.75, 1.45, -8.4], look: [-1.75, 0.95, -13.0], fov: 34}], [CH(5), {pos: [-0.85, 1.4, -9.0], look: [-1.75, 0.95, -13.0], fov: 33}]]);
  const pat = bump(t, K.computer - 0.15, K.computer + 0.25) + bump(t, K.computer + 0.25, K.computer + 0.6);
  const drawer = smooth(prog(t, K.work - 0.25, K.work + 0.2)), shrug = t > K.work + 0.35;
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<Room t={t} drawer={drawer} />}>
    <Cel at={KCH}><Ken view={shrug ? 'front' : 'left'} {...seat(shrug ? -0.6 : -1)} handL={shrug ? [-150, -250] : drawer > 0.1 ? [-110, -150] : [-118, -188 + 14 * pat]} handR={shrug ? [150, -250] : [74, -128]}
      faceDy={!shrug && drawer > 0.1 ? 14 : 0} lookY={!shrug && drawer > 0.1 ? 7 : 0} eyes={shrug ? 'wide' : 'dot'} mouth={shrug ? 'flat' : 'frown'} browUp={shrug ? 1 : 0.3} headTilt={shrug ? 6 : 0} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- E: just a ticking clock (Ken looks up at it)
const ClockShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(5), {pos: [-1.55, 1.25, -9.0], look: [-0.75, 1.6, -15.9], fov: 44}], [CH(6), {pos: [-1.5, 1.28, -9.5], look: [-0.72, 1.62, -15.9], fov: 43}]]);
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<Room t={t} />}>
    <Cel at={KCH}><Ken view="front" {...seat(-0.6)} faceDy={-16} lookY={-9} faceDx={14} lookX={5} eyes="dot" mouth="flat" headTilt={-3 * Math.sin(t * 6.28)} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- F / T: the man in the corner with his feet up (Monday: same frame, empty)
const CORNER0: Cam3 = {pos: [0.9, 1.45, -8.7], look: [1.55, 0.95, -14.4], fov: 36}, CORNER1: Cam3 = {pos: [1.05, 1.4, -9.6], look: [1.6, 0.92, -14.4], fov: 34};
const CornerShot: React.FC<{t: number; t0: number; t1: number; monday?: boolean}> = ({t, t0, t1, monday}) => {
  const cam = cam3At(t, [[t0, CORNER0], [t1, CORNER1]]);
  return (<World cam={cam} light={monday ? ROOM_MON : ROOM} sky={SKY_ROOM} scene={<Room t={t} taro={monday ? 'cleared' : 'full'} />} front={monday ? undefined : taroPhone(cam, 1)}>
    {!monday && <TaroCel t={t} dir={1} wave={bump(t, K.feet + 0.1, K.feet + 0.9)} />}
  </World>);
};

// ---------------------------------------------------------------- G / H: your new job is nothing; sit here until six
const BOSS_RM: V3 = [0.15, 0, -13.35];
const JobShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(8), {pos: [-0.65, 1.5, -6.6], look: [-0.65, 1.05, -13.2], fov: 42}], [K.nothing - 0.3, {pos: [-0.65, 1.48, -7.1], look: [-0.65, 1.05, -13.2], fov: 41}], [K.nothing + 0.4, {pos: [-1.2, 1.38, -9.9], look: [-1.4, 1.15, -13.0], fov: 32}], [CH(11), {pos: [-1.25, 1.38, -10.1], look: [-1.42, 1.15, -13.0], fov: 31}]]);
  const says = t > K.nothing - 1.1, nothing = t > K.nothing - 0.05;
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<Room t={t} />}>
    <Cel at={BOSS_RM} h={1.76}><Boss view="left" faceDx={-12} handL={nothing ? [-170, -250] : says ? [-120, -300] : [-74, -128]} handR={nothing ? [170, -250] : [74, -128]} mouth="grin" eyes={nothing ? 'closed' : 'dot'} bounce={4 * spring(t, K.nothing - 0.05, 3, 5)} headTilt={nothing ? -6 : 0} /></Cel>
    <Cel at={KCH}><Ken view="front" {...seat(-0.6)} faceDx={20} lookX={6} eyes={nothing ? 'wide' : 'dot'} mouth={nothing ? 'o' : 'flat'} browUp={nothing ? 1.1 : 0.2} headTilt={nothing ? 4 * spring(t, K.nothing, 2.5, 4) : 0} blink={bump(t, CH(8) + 0.6, CH(8) + 0.75)} /></Cel>
  </World>);
};
const SixShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(11), {pos: [-0.6, 1.6, -6.4], look: [-0.62, 1.45, -14.5], fov: 44}], [CH(12), {pos: [-0.6, 1.58, -6.9], look: [-0.62, 1.45, -14.5], fov: 43}]]);
  const point = t > CH(11) + 0.3, sweep = smooth(prog(t, K.six - 0.35, K.six + 0.3));
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<Room t={t} clock={lerp(3.7, 6.0, sweep)} />}>
    <Cel at={BOSS_RM} h={1.76}><Boss view="front" handR={point ? [130, -480] : [74, -128]} handL={t < CH(11) + 0.3 ? [30, -200] : [-74, -128]} faceDy={point ? -10 : 0} lookY={point ? -7 : 0} lookX={point ? -3 : 0} mouth="grin" /></Cel>
    <Cel at={KCH}><Ken view="front" {...seat(-0.6)} faceDy={-12} lookY={-8} lookX={6} faceDx={16} eyes="dot" mouth={sweep > 0.5 ? 'frown' : 'flat'} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- I: at first it feels like a holiday (the calendar starts its pages)
const HolidayShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(12), {pos: [-0.9, 1.45, -8.0], look: [-1.3, 1.1, -13.6], fov: 38}], [K.holiday + 0.1, {pos: [-1.0, 1.42, -8.6], look: [-1.35, 1.12, -13.6], fov: 36}], [CH(14), {pos: [-1.05, 1.4, -8.9], look: [-1.35, 1.12, -13.6], fov: 35}]]);
  const st = smooth(prog(t, K.holiday - 0.35, K.holiday + 0.15)), happy = t > K.holiday - 0.2;
  const sp = [[-150, -560, 0], [150, -520, 0.15], [0, -620, 0.3]] as [number, number, number][];
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<Room t={t} beam={1} week={smooth(prog(t, K.holiday + 0.8, CH(14))) * 0.99} />}>
    <Cel at={KCH}><Ken view={happy ? 'front' : 'left'} {...seat(happy ? -0.6 : -1)} handL={[lerp(-74, -100, st), lerp(-128, -400, st)]} handR={[lerp(74, 100, st), lerp(-128, -400, st)]} handsBack={happy}
      eyes={happy ? 'closed' : 'dot'} mouth={happy ? 'grin' : 'smile'} headTilt={happy ? 6 * Math.sin((t - K.holiday) * 2.5) : 0} bounce={happy ? 4 * spring(t, K.holiday, 2, 3) : 0} />
      {sp.map(([x, y, d], i) => { const s = pop(t, K.holiday + d, 0.3) * (1 - smooth(prog(t, K.holiday + 1.1 + d, K.holiday + 1.4 + d))); return <Sparkle key={i} x={x} y={y + 10 * Math.sin(t * 6 + i)} r={34 * s} fill="#FFE14D" />; })}
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- J: then co-workers start staring (by the water cooler)
const StareShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(14), {pos: [-0.1, 1.55, -0.6], look: [-0.1, 1.1, -7.4], fov: 46}], [CH(16), {pos: [-0.1, 1.52, -1.1], look: [-0.1, 1.1, -7.4], fov: 45}]]);
  const u = smooth(prog(t, CH(14), K.staring - 0.3)), s = t > K.staring - 0.25, s2 = t > K.staring - 0.05;
  const kAt: V3 = [lerp(1.4, 0.6, u), 0, -6.6];
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} />} front={kenMug(cam, kAt)}>
    <Cel at={[-1.1, 0, -7.9]} h={1.66}><Person id="cw1" outfit={CO[2]} view={s ? 'right' : 'front'} faceDx={s ? 30 : 0} lookX={s ? 9 : 0} eyes={s ? 'wide' : 'dot'} mouth={s ? 'flat' : 'smile'} brow={s ? 0.5 : 0} handR={s ? [74, -128] : [110, -220]} /></Cel>
    <Cel at={[-0.35, 0, -8.3]} h={1.66}><Person id="cw2" outfit={CO[0]} view={s2 ? 'right' : 'left'} faceDx={s2 ? 30 : 0} lookX={s2 ? 9 : 0} eyes={s2 ? 'wide' : 'dot'} mouth={s2 ? 'flat' : 'smile'} brow={s2 ? 0.5 : 0} handL={s2 ? [-74, -128] : [-110, -220]} /></Cel>
    <Cel at={kAt}><Ken view={u < 1 ? 'left' : 'front'} {...walk(u * 4 * Math.PI, u > 0 && u < 1)} handR={[72, -200]} faceDx={s ? -28 : 0} lookX={s ? -8 : 0} eyes="dot" mouth={s ? 'wavy' : 'smile'} sweat={s ? smooth(prog(t, K.staring, K.staring + 0.3)) : 0} brow={s ? -0.6 : 0} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- K: the emails stop (Ken holds up his phone)
const EmailShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(16), {pos: [-1.3, 1.4, -9.3], look: [-1.4, 1.12, -13.0], fov: 34}], [CH(17), {pos: [-1.32, 1.38, -9.7], look: [-1.4, 1.12, -13.0], fov: 33}]]);
  const rows = 5 - 5 * prog(t, K.emails - 0.1, K.emails + 0.6), sad = rows < 1;
  const hp = celPoint(cam, KCH, 1.7, [52, -262]);
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<Room t={t} week={1} />} front={<Phone pos={hp} rot={[-0.1, 0, 0]} rows={rows} s={1.5} dim={sad && t > K.emails + 0.8} />}>
    <Cel at={KCH}><Ken view="front" {...seat(-0.6)} handR={[46, -250]} handL={[-74, -128]} faceDx={8} faceDy={8} lookX={4} lookY={6} eyes="dot" mouth={sad ? 'frown' : 'flat'} brow={sad ? -0.8 : 0} tint="#CFE7F7" tintAmt={sad ? 0.35 : 0} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- L / M: his old desk, someone else's photos
const OLD_AT: V3 = [-0.25, 0, 1.75];
const OldDeskShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(17), {pos: [0.3, 1.55, 7.6], look: [0.35, 1.0, 1.5], fov: 38}], [K.photos - 0.2, {pos: [0.3, 1.5, 6.9], look: [0.35, 1.0, 1.5], fov: 37}]]);
  const stop = t > K.desk - 0.1, u = smooth(prog(t, CH(17), K.desk)), at: V3 = [lerp(-1.0, OLD_AT[0], u), 0, OLD_AT[2]];
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} stranger />} front={kenMug(cam, at)}>
    <Seated t={t} w={{at: [0.95, 0, 1.5], side: 1, o: 2}} i={7} />
    <Cel at={at}><Ken view={stop ? 'right' : 'right'} {...walk(u * 4 * Math.PI, !stop)} handR={[72, -200]} eyes={stop ? 'wide' : 'dot'} mouth={stop ? 'o' : 'flat'} browUp={stop ? 0.9 : 0} /></Cel>
  </World>);
};
const PhotoShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[K.photos - 0.2, {pos: [0.95, 1.12, 2.5], look: [1.82, 0.84, 1.92], fov: 30}], [CH(19), {pos: [1.2, 1.02, 2.3], look: [1.82, 0.84, 1.92], fov: 28}]]);
  return <World cam={cam} light={{...OFFICE, focus: [1.7, 0.7, 1.7], span: 2}} sky={SKY_OFFICE} scene={<Office t={t} stranger />} />;
};

// ---------------------------------------------------------------- N / O / P: every Friday the boss leans in, smiling (both in frame)
const FRIDAY0: Cam3 = {pos: [-0.85, 1.55, -19.4], look: [-0.85, 1.15, -11.6], fov: 38};
const FridayShot: React.FC<{t: number; t0: number; t1: number; light: Light; again?: boolean}> = ({t, t0, t1, light, again}) => {
  const cam = cam3At(t, [[t0, FRIDAY0], [again ? t1 : K.smiling - 0.3, {pos: [-0.85, 1.55, -18.8], look: [-0.85, 1.18, -11.6], fov: 37}], ...(again ? [] : [[K.smiling + 0.3, {pos: [0.1, 1.5, -15.4], look: [-0.05, 1.3, -10.6], fov: 34}] as [number, Cam3], [t1, {pos: [0.1, 1.5, -15.2], look: [-0.05, 1.3, -10.6], fov: 33}] as [number, Cam3]])]);
  const open = again ? 2.85 : 2.85 * smooth(prog(t, t0 + 0.05, t0 + 0.4)), lean = again ? 1 : smooth(prog(t, t0 + 0.3, t0 + 0.8));
  const grin = again || t > K.smiling - 0.2, forced = again || t > K.smiling + 0.2;
  return (<World cam={cam} light={light} sky={SKY_ROOM} scene={<><Office t={t} door={open} /><Room t={t} back={false} week={again ? 3 : 2} /></>}
    front={<><Box pos={[0.9, 0, -10.1]} size={[0.84, 3.1, 0.2]} color="#B8C1B5" map={tex('speckle', [2, 3], 6)} cast={false} /><Box pos={[0.53, 0, -9.98]} size={[0.08, 2.14, 0.06]} color="#6F777E" cast={false} /></>}>
    <TaroCel t={t} dir={-1} asleep={again} />
    <Cel at={[lerp(0.85, 0.08, lean), 0, -10.3]} h={1.76}><Boss view="right" lean={14 * lean} mouth={grin ? 'grin' : 'smile'} eyes={grin ? 'closed' : 'dot'} handL={grin ? [-120, -330 + 8 * Math.sin(t * 8)] : [-74, -128]} browUp={grin ? 0.8 : 0} headTilt={grin ? -8 + 3 * Math.sin(t * 4) : 0} /></Cel>
    <Cel at={KCH}><Ken view="front" {...seat(0.6)} mouth={forced ? 'teeth' : 'flat'} eyes="dot" brow={forced ? -0.7 : 0} browUp={forced ? 0.4 : 0} sweat={forced ? 1 : 0} faceDx={-22} lookX={-7} handR={forced ? [100, -300] : [74, -128]} /></Cel>
  </World>);
};
const ForcedSmile: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(21), {pos: [-1.2, 1.42, -9.5], look: [-1.42, 1.15, -13.0], fov: 32}], [CH(22), {pos: [-1.22, 1.42, -9.8], look: [-1.42, 1.16, -13.0], fov: 31}]]);
  const up = smooth(prog(t, K.enjoying - 0.2, K.enjoying + 0.15));
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<Room t={t} week={2} />}>
    <Cel at={KCH}><Ken view="front" {...seat(0.6)} mouth="teeth" eyes="dot" brow={-0.7} browUp={0.4} sweat={up} handR={[lerp(74, 110, up), lerp(-128, -300, up)]} headTilt={3 * Math.sin(t * 7) * up} faceDx={-14} lookX={-6} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- Q / R: years in the corner; so you put your feet up too
const YearsShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(23), {pos: [0.9, 2.3, -10.6], look: [1.6, 1.1, -14.4], fov: 40}], [CH(25), {pos: [1.0, 1.45, -9.4], look: [1.6, 0.95, -14.4], fov: 35}]]);
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<Room t={t} week={3} />} front={taroPhone(cam, 1, 0, true)}><TaroCel t={t} dir={1} asleep /></World>);
};
const FeetUpShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(25), {pos: [0, 1.6, -5.0], look: [0, 0.98, -13.6], fov: 44}], [CH(26), {pos: [0, 1.58, -5.4], look: [0, 0.98, -13.6], fov: 44}]]);
  const u = smooth(prog(t, K.feet2 - 0.35, K.feet2 + 0.2));
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<Room t={t} week={3} />} front={taroPhone(cam, 1)}>
    <TaroCel t={t} dir={1} />
    <Cel at={KCH}><Ken view="left" {...(u > 0 ? feetUp(-1, u) : seat(-1))} handL={[lerp(-74, -70, u), lerp(-128, -360, u)]} handR={[lerp(74, 70, u), lerp(-128, -360, u)]} handsBack={u > 0.5}
      eyes={u > 0.6 ? 'closed' : 'dot'} mouth={u > 0.6 ? 'smile' : 'flat'} faceDx={u > 0.6 ? 0 : 14} lookX={u > 0.6 ? 0 : 6} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- U: his desk is cleared (Ken beside the bare desk, face drains)
const ClearedShot: React.FC<{t: number}> = ({t}) => {
  const at: V3 = [0.75, 0, -13.9];
  const cam = cam3At(t, [[CH(28), {pos: [0.9, 1.5, -8.6], look: [1.25, 1.0, -14.2], fov: 36}], [K.cleared + 0.3, {pos: [0.85, 1.45, -9.6], look: [1.15, 1.08, -14.0], fov: 33}], [CH(29), {pos: [0.85, 1.45, -9.8], look: [1.15, 1.1, -14.0], fov: 32}]]);
  const pale = smooth(prog(t, K.cleared - 0.1, K.cleared + 0.3));
  return (<World cam={cam} light={{...ROOM_MON, focus: [1.2, 0, -14], span: 3}} sky={SKY_ROOM} scene={<Room t={t} taro="cleared" week={4} />} front={kenMug(cam, at)}>
    <Cel at={at}><Ken view="front" tint="#BFE3FF" tintAmt={pale} faceDx={pale > 0.5 ? 0 : 26} lookX={pale > 0.5 ? 0 : 8} eyes={pale > 0.5 ? 'wide' : 'dot'} mouth={pale > 0.5 ? 'wavy' : 'smile'} browUp={pale > 0.5 ? 1 : 0} brow={pale > 0.5 ? -0.8 : 0}
      handR={[72, -200]} sweat={pale} bounce={-3 * pale} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- V / W: in Japan, firing someone without a strong reason is very hard; so they take away the work
const CW_AT: V3 = [-0.95, 0, -1.5], BOSS_OF: V3 = [0.45, 0, -1.1];
const LAW_CAM0: Cam3 = {pos: [0.25, 1.5, 4.4], look: [-0.25, 1.0, -1.4], fov: 40}, LAW_CAM1: Cam3 = {pos: [0.25, 1.48, 3.7], look: [-0.25, 1.02, -1.4], fov: 39};
const Padlock: React.FC<{pos: V3; s: number; jig: number}> = ({pos, s, jig}) => s <= 0.01 ? null : (<group position={pos} scale={s} rotation={[0, 0, 0.15 * jig]}>
  <mesh position={[0, 0.2, 0]} castShadow><torusGeometry args={[0.1, 0.028, 10, 24, Math.PI]} /><meshStandardMaterial color="#B8BEC6" metalness={0.6} roughness={0.3} /></mesh>
  <Box size={[0.3, 0.24, 0.1]} r={0.03} color="#E6B23A" rough={0.35} metal={0.4} />
  <Cyl pos={[0, 0.1, 0.05]} rot={[Math.PI / 2, 0, 0]} r={0.025} h={0.02} color="#3A3A3E" cast={false} />
</group>);
const LawShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(29), LAW_CAM0], [CH(33), LAW_CAM1]]);
  const inn = smooth(prog(t, CH(29), K.firing - 0.1)), reach = smooth(prog(t, K.firing - 0.05, K.firing + 0.35)), locked = t > CH(31) - 0.05, fail = t > K.hard - 0.3;
  const bAt: V3 = [lerp(1.4, BOSS_OF[0], inn), 0, BOSS_OF[2]];
  const lockS = Math.min(pop(t, CH(31) + 0.05, 0.3), 1), lockS2 = pop(t, CH(31) + 0.4, 0.3), jig = spring(t, K.hard - 0.3, 4, 5);
  const hand: [number, number] = fail ? [-30, -420] : locked ? [lerp(-150, -110, smooth(prog(t, CH(31), CH(31) + 0.3))), -240 + 30 * smooth(prog(t, CH(31) + 0.3, CH(31) + 0.6))] : [lerp(-74, -150, reach), lerp(-128, -250, reach)];
  const slipHand: [number, number] = locked && !fail ? [hand[0] - 10, hand[1]] : [-150, -250];
  const sp = celPoint(cam, bAt, 1.76, [slipHand[0] - 18, slipHand[1] - 6]);
  const fallU = prog(t, K.hard - 0.3, K.hard + 0.25);
  const slip: V3 = fail ? [sp[0] - 0.1 * fallU, Math.max(0.03, sp[1] - 1.0 * fallU * fallU), sp[2] + 0.1 * fallU] : sp;
  const red = smooth(prog(t, K.hard - 0.1, K.hard + 0.3));
  return (<World cam={cam} light={{...OFFICE, focus: [-0.2, 0, -1.3], span: 4}} sky={SKY_OFFICE} scene={<Office t={t} flag />}
    front={reach > 0.05 || locked ? <group><Box pos={slip} rot={[0, 0, fail ? fallU * 4 : 0.1]} size={[0.24, 0.17, 0.004]} r={0} color="#F49AC1" rough={0.6} />
      <Padlock pos={[slip[0] - 0.07, slip[1] - 0.02, slip[2] + 0.03]} s={0.42 * lockS} jig={jig} /><Padlock pos={[slip[0] + 0.07, slip[1] - 0.02, slip[2] + 0.03]} s={0.42 * lockS2} jig={-jig} /></group> : null}>
    <Seated t={t} w={{at: CW_AT, side: -1, o: 0}} i={1} />
    <Cel at={bAt} h={1.76}><Boss view="left" {...walk(inn * 4 * Math.PI, inn > 0 && inn < 1)} handL={hand} handR={fail ? [74, -128] : [74, -128]} mouth={fail ? 'frown' : locked ? 'o' : 'grin'} eyes={locked && !fail ? 'wide' : 'dot'}
      brow={fail ? 0.9 : 0} browUp={locked && !fail ? 1 : 0} tint="#F26B5B" tintAmt={red * 0.75} steam={red} t={t} headTilt={fail ? 6 * Math.sin((t - K.hard) * 3) : 0} /></Cel>
  </World>);
};
const TakeShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(33), LAW_CAM1], [CH(35), {pos: [0.25, 1.46, 3.3], look: [-0.2, 1.02, -1.4], fov: 39}]]);
  const lift = t > K.takeaway - 0.1, carry = smooth(prog(t, K.takeaway + 0.25, CH(35) + 0.2));
  const bAt: V3 = [lerp(BOSS_OF[0], 2.6, carry), 0, BOSS_OF[2]];
  const mp = celPoint(cam, bAt, 1.76, [0, -250]);
  return (<World cam={cam} light={{...OFFICE, focus: [-0.2, 0, -1.3], span: 4}} sky={SKY_OFFICE} scene={<Office t={t} flag taken={lift ? 2 : 0} />}
    front={lift ? <group position={[mp[0], mp[1] - 0.18, mp[2]]}><Monitor pos={[0, 0, 0]} face={0} hue="#BDE7C4" /><Box pos={[0, 0.48, 0]} size={[0.26, 0.09, 0.34]} color="#E2A93B" /></group> : null}>
    <Seated t={t} w={{at: CW_AT, side: -1, o: 0}} i={1} pose={lift ? {view: 'front', faceDx: 24, lookX: 8, eyes: 'wide', mouth: 'o', browUp: 1, handL: [-74, -128], handR: [74, -128], ...seat(-0.6)} : {}} />
    <Cel at={bAt} h={1.76}><Boss view={carry > 0 ? 'right' : 'left'} {...walk(carry * 5 * Math.PI, carry > 0 && carry < 1)} handL={lift ? [-60, -250] : [-120, -200]} handR={lift ? [60, -250] : [74, -128]} mouth="grin" eyes="closed" /></Cel>
  </World>);
};

// ---------------------------------------------------------------- X: and wait for you to leave (the boss by the door, Ken walks out with a box)
const WaitShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(35), {pos: [0.2, 1.6, -3.2], look: [0.35, 1.2, -9.6], fov: 40}], [CH(36), CAM0]]);
  const out = smooth(prog(t, K.leave - 0.35, CH(36) + 0.4)), stand = t > K.leave - 0.2;
  const spin = 3.0 + 9 * smooth(prog(t, K.wait - 0.2, K.leave));
  const kAt: V3 = [lerp(0.0, -0.45, out), 0, lerp(-10.3, -8.9, out)];
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<><Office t={t} door={2.85} clock={spin} room={<Room t={t} back taro="cleared" />} /><OfficeChair pos={[1.25, 0, -9.3]} side={1} /></>}
    front={out > 0 ? <Box pos={celPoint(cam, kAt, 1.7, [0, -176])} size={[0.46, 0.3, 0.34]} r={0.01} color="#C8955E" map={tex('speckle', [2, 2], 14)} /> : null}>
    <Cel at={stand ? BOSS_DOOR : [1.2, 0, -9.3]} h={1.76}><Boss {...(stand ? bossWaitPose(t) : {view: 'left', ...seat(-1), handL: [-30, -250], handR: [-60, -230], mouth: 'flat', eyes: 'dot', faceDy: 8, lookY: 6})}
      bounce={stand ? 4 * spring(t, K.leave - 0.2, 3, 5) : 0} /></Cel>
    {out > 0 && <Cel at={kAt}><Ken view="front" {...walk(out * 4 * Math.PI, out < 1)} handL={[-96, -170]} handR={[96, -170]} eyes="dot" mouth="frown" brow={-0.6} /></Cel>}
  </World>);
};

// ---------------------------------------------------------------- Y + CTA: chase-out rooms; Ken walks off, the door shuts, the boss waits again (= frame 0)
const Ending: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(36), CAM0], [K.subscribe - 0.3, {pos: [0.3, 1.62, -3.0], look: [0.4, 1.25, -9.6], fov: 39}], [K.subscribe + 1.0, CAM0]]);
  const go = smooth(prog(t, CH(36), K.chaseout + 0.3)), open = 2.85 * (1 - smooth(prog(t, K.chaseout - 0.45, K.chaseout + 0.35)));
  const kAt: V3 = [lerp(-0.45, -1.6, go), 0, lerp(-8.9, -4.6, go)];
  const look = t > K.subscribe && t < END - 0.85;
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} door={open} room={open > 0.02 ? <Room t={t} taro="cleared" /> : null} />}
    front={go < 1 ? <Box pos={celPoint(cam, kAt, 1.7, [0, -176])} size={[0.46, 0.3, 0.34]} r={0.01} color="#C8955E" map={tex('speckle', [2, 2], 14)} /> : null}>
    <Cel at={BOSS_DOOR} h={1.76}><Boss {...bossWaitPose(t)} faceDy={look ? -12 : 0} lookY={look ? -7 : 0} browUp={look ? 0.8 : 0} eyes={look && t > K.strange ? 'closed' : 'dot'} /></Cel>
    {go < 1 && <Cel at={kAt}><Ken view="left" {...walk(go * 6 * Math.PI, go < 1)} handL={[-96, -170]} handR={[96, -170]} eyes="dot" mouth="frown" brow={-0.6} /></Cel>}
  </World>);
};

// ---------------------------------------------------------------- composition
const Scenes: React.FC<{t: number}> = ({t}) => (
  <Cuts t={t} shots={[
    [0, <Opening t={t} />], [CH(1), <Walk t={t} />], [CH(2), <DoorShot t={t} t0={CH(2)} t1={CH(3)} />], [CH(3), <BareDesk t={t} />], [CH(5), <ClockShot t={t} />],
    [CH(6), <CornerShot t={t} t0={CH(6)} t1={CH(8)} />], [CH(8), <JobShot t={t} />], [CH(11), <SixShot t={t} />], [CH(12), <HolidayShot t={t} />],
    [CH(14), <StareShot t={t} />], [CH(16), <EmailShot t={t} />], [CH(17), <OldDeskShot t={t} />], [K.photos - 0.2, <PhotoShot t={t} />],
    [CH(19), <FridayShot t={t} t0={CH(19)} t1={CH(21)} light={ROOM} />], [CH(21), <ForcedSmile t={t} />], [CH(22), <FridayShot t={t} t0={CH(22)} t1={CH(23)} light={ROOM_EVE} again />],
    [CH(23), <YearsShot t={t} />], [CH(25), <FeetUpShot t={t} />], [CH(26), <DoorShot t={t} t0={CH(26)} t1={CH(27)} light={ROOM_MON} monday />], [CH(27), <CornerShot t={t} t0={CH(27)} t1={CH(28)} monday />],
    [CH(28), <ClearedShot t={t} />], [CH(29), <LawShot t={t} />], [CH(33), <TakeShot t={t} />], [CH(35), <WaitShot t={t} />], [CH(36), <Ending t={t} />]]} />);
export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({voice = false, captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Scenes t={t} />
    <Cta t={t} tIn={K.subscribe - 0.1} tClick={K.strange + 0.05} tBell={K.this} tOut={END - 0.8} y={300} />
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
