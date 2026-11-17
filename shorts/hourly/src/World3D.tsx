import React, {createContext, useContext, useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {KScale} from './Layer';
import {lvl} from './detail';
import {clamp, eio, lerp, smooth} from './math';

/* v3 world: a REAL stylized 3D environment (three.js: perspective, textures, ambient + directional light, cast and
 * contact shadows) with FLAT 2D cel characters composited on top at their projected 3D positions.
 * Units: metres. Y is up. The ground is y = 0. Design frame 1080x1920.
 * Rule: everything in the world is a shaded 3D mesh; everything alive is a flat SVG cel. Never mix the two looks. */
export const W = 1080, H = 1920;
export type V3 = [number, number, number];
export type Cam3 = {pos: V3; look: V3; fov: number};          // fov = vertical field of view in degrees
/** [time, camera] or [time, camera, ease]: the optional ease shapes the move INTO this key (EASE.slam / dive / whip /
 *  punch from Moves.tsx for fast accents); keys without one use cam3At's default smooth glide. */
export type Cam3Key = [number, Cam3] | [number, Cam3, (u: number) => number];
const l3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** camera from keys [[time, {pos, look, fov}], ...]; eased glides. Two keys at the same time = a clean cut. */
export const cam3At = (t: number, ks: Cam3Key[], ease = eio): Cam3 => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = ks.length - 1; i >= 0; i--) if (t >= ks[i][0]) {
    const a = ks[i], b = ks[i + 1]; if (!b) return a[1];
    const u = (b[2] ?? ease)((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
    return {pos: l3(a[1].pos, b[1].pos, u), look: l3(a[1].look, b[1].look, u), fov: lerp(a[1].fov, b[1].fov, u)};
  }
  return ks[0][1];
};
const mkCam = (c: Cam3) => {
  const cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.1, 400);
  cam.position.set(...c.pos); cam.lookAt(...c.look); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); return cam;
};
/** project a world point: screen x, y (design px), s = screen px per metre at that depth, depth = metres in front of the lens */
export const toScreen = (c: Cam3, p: V3) => {
  const cam = mkCam(c); const v = new THREE.Vector3(...p);
  const depth = -v.clone().applyMatrix4(cam.matrixWorldInverse).z; if (depth <= 0.05) return null;
  v.project(cam);
  return {x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, s: (H / 2) / (Math.tan(c.fov * Math.PI / 360) * depth), depth};
};
/** world position of a point given in a cel's own drawing units (Person: feet (0,0), head top about (0,-430)), for
 *  putting a 3D prop exactly in a flat character's hand. at = the cel's feet, h = its height in metres. */
export const celPoint = (c: Cam3, at: V3, h: number, p: [number, number], unitsTall = 430): V3 => {
  const cam = mkCam(c); const r = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0); r.y = 0; r.normalize();
  const k = h / unitsTall; return [at[0] + r.x * p[0] * k, at[1] - p[1] * k, at[2] + r.z * p[0] * k];
};

// ------------------------------------------------------------------------------------------------ textures (code-made)
export type TexKind = 'speckle' | 'planks' | 'bricks' | 'tiles' | 'stripes' | 'grass' | 'checker' | 'panels';
const texCache = new Map<string, THREE.CanvasTexture>();
const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
/** tileable material texture drawn in code (light greys that multiply the mesh colour). rep = repeats across the mesh. */
export const tex = (kind: TexKind, rep: [number, number] = [1, 1], seed = 7): THREE.CanvasTexture => {
  const key = `${kind}/${rep}/${seed}`; const hit = texCache.get(key); if (hit) return hit;
  const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d')!; const r = rng(seed);
  const grey = (v: number) => `rgb(${v},${v},${v})`;
  g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
  const speck = (n: number, lo: number, hi: number, sz = 2.2) => { for (let i = 0; i < n; i++) { g.fillStyle = grey(Math.round(lo + r() * (hi - lo))); const x = r() * S, y = r() * S, s = 0.6 + r() * sz; g.fillRect(x, y, s, s); } };
  if (kind === 'speckle') speck(2600, 205, 250);
  if (kind === 'grass') { speck(1800, 200, 250, 1.5); g.lineWidth = 1.5; for (let i = 0; i < 700; i++) { g.strokeStyle = grey(Math.round(190 + r() * 60)); const x = r() * S, y = r() * S; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y - 3 - r() * 6); g.stroke(); } }
  if (kind === 'planks') { const n = 4; for (let i = 0; i < n; i++) { g.fillStyle = grey(Math.round(228 + r() * 27)); g.fillRect(0, i * S / n, S, S / n);
      g.strokeStyle = grey(206); g.lineWidth = 1; for (let j = 0; j < 5; j++) { const y = i * S / n + 6 + r() * (S / n - 12); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(S / 3, y + (r() - 0.5) * 8, 2 * S / 3, y + (r() - 0.5) * 8, S, y); g.stroke(); }
      g.fillStyle = grey(150); g.fillRect(0, i * S / n, S, 3); const jx = Math.round(r() * S); g.fillRect(jx, i * S / n, 3, S / n); } }
  if (kind === 'bricks') { const rows = 8, bw = S / 4, bh = S / rows; g.fillStyle = grey(170); g.fillRect(0, 0, S, S);
    for (let j = 0; j < rows; j++) for (let i = -1; i < 5; i++) { g.fillStyle = grey(Math.round(222 + r() * 33)); g.fillRect(i * bw + (j % 2 ? bw / 2 : 0) + 2, j * bh + 2, bw - 4, bh - 4); }
    speck(500, 200, 240, 1.4); }
  if (kind === 'tiles' || kind === 'checker') { const n = 4, c = S / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = kind === 'checker' ? ((i + j) % 2 ? grey(196) : grey(250)) : grey(Math.round(236 + r() * 19)); g.fillRect(i * c, j * c, c, c); }
    if (kind === 'tiles') { g.strokeStyle = grey(168); g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * c, 0); g.lineTo(i * c, S); g.moveTo(0, i * c); g.lineTo(S, i * c); g.stroke(); } } }
  if (kind === 'stripes') { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? grey(205) : grey(252); g.fillRect(i * S / 8, 0, S / 8, S); } }
  if (kind === 'panels') { g.strokeStyle = grey(176); g.lineWidth = 4; g.strokeRect(10, 10, S - 20, S - 20); g.strokeStyle = grey(236); g.lineWidth = 2; g.strokeRect(16, 16, S - 32, S - 32); speck(500, 225, 250, 1.4); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  texCache.set(key, t); return t;
};
let blobTex: THREE.CanvasTexture | null = null;
const blob = () => { if (blobTex) return blobTex; const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 6, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); blobTex = new THREE.CanvasTexture(cv); return blobTex; };

// ------------------------------------------------------------------------------------------------ modelled objects
export type Mat = {color?: string; map?: THREE.Texture; rough?: number; metal?: number; emissive?: string; glow?: number; opacity?: number; cast?: boolean; receive?: boolean};
const M: React.FC<Mat> = ({color = '#CFCFCF', map, rough = 0.86, metal = 0, emissive = '#000000', glow = 0, opacity = 1}) =>
  <meshStandardMaterial color={color} map={map ?? null} roughness={rough} metalness={metal} emissive={emissive} emissiveIntensity={glow} transparent={opacity < 1} opacity={opacity} />;
type Place = {pos?: V3; rot?: V3; scale?: number | V3};
/** box standing ON pos (pos = centre of its bottom face). r = edge rounding in metres (soft, modelled look). */
export const Box: React.FC<Place & Mat & {size: V3; r?: number}> = ({pos = [0, 0, 0], rot = [0, 0, 0], scale = 1, size, r = 0.03, cast = true, receive = true, ...m}) => {
  const geo = useMemo(() => { const rr = Math.min(r, Math.min(...size) / 2 - 1e-3); return rr > 0.004 ? new RoundedBoxGeometry(size[0], size[1], size[2], 3, rr) : new THREE.BoxGeometry(...size); }, [size[0], size[1], size[2], r]);
  return <group position={pos} rotation={rot} scale={scale}><mesh geometry={geo} position={[0, size[1] / 2, 0]} castShadow={cast} receiveShadow={receive}><M {...m} /></mesh></group>;
};
/** cylinder / cone / tapered post standing on pos. rTop = 0 makes a cone. */
export const Cyl: React.FC<Place & Mat & {r: number; h: number; rTop?: number; seg?: number}> = ({pos = [0, 0, 0], rot = [0, 0, 0], scale = 1, r, h, rTop, seg = 40, cast = true, receive = true, ...m}) =>
  <group position={pos} rotation={rot} scale={scale}><mesh position={[0, h / 2, 0]} castShadow={cast} receiveShadow={receive}><cylinderGeometry args={[rTop ?? r, r, h, seg]} /><M {...m} /></mesh></group>;
/** sphere centred on pos (squash with scale) */
export const Ball: React.FC<Place & Mat & {r: number}> = ({pos = [0, 0, 0], rot = [0, 0, 0], scale = 1, r, cast = true, receive = true, ...m}) =>
  <mesh position={pos} rotation={rot} scale={scale} castShadow={cast} receiveShadow={receive}><sphereGeometry args={[r, 48, 32]} /><M {...m} /></mesh>;
/** many copies of one shape as ONE draw call. Use it for anything repeated (coins, eggs, clouds, tree crowns, fruit,
 *  hills, pebbles, rain): on software WebGL the cost is per separate (textured) mesh, NOT per triangle or per pixel.
 *  items: [{p: position, s: scale (number or [x,y,z]), r: rotation, c: colour}]. k = a key that changes when the
 *  instance count or material must be rebuilt. geo is called once. */
export type Inst = {p: V3; s?: V3 | number; r?: V3; c?: string};
const _D = new THREE.Object3D(), _C = new THREE.Color();
export const Instances: React.FC<{geo: () => THREE.BufferGeometry; items: Inst[]; color?: string; map?: THREE.Texture; rough?: number; metal?: number; emissive?: string; glow?: number; cast?: boolean; receive?: boolean; k?: string}> =
  ({geo, items, color = '#FFFFFF', map, rough = 0.85, metal = 0, emissive = '#000000', glow = 0, cast = true, receive = true, k = ''}) => {
  const n = Math.max(1, items.length);
  const mesh = useMemo(() => { const m = new THREE.InstancedMesh(geo(), new THREE.MeshStandardMaterial({color: '#FFFFFF', map: map ?? null, roughness: rough, metalness: metal, emissive: new THREE.Color(emissive), emissiveIntensity: glow}), n);
    m.frustumCulled = false; return m; }, [n, k]);
  mesh.castShadow = cast; mesh.receiveShadow = receive; mesh.count = items.length;
  items.forEach((it, i) => { const sc = it.s ?? 1; _D.position.set(...it.p); _D.rotation.set(...(it.r ?? [0, 0, 0] as V3)); if (typeof sc === 'number') _D.scale.setScalar(sc); else _D.scale.set(...sc);
    _D.updateMatrix(); mesh.setMatrixAt(i, _D.matrix); _C.set(it.c ?? color); mesh.setColorAt(i, _C); });
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return <primitive object={mesh} />;
};
/** flat floor / ground / road / water sheet at height y, centred on (x, z) */
export const Ground: React.FC<Mat & {size?: [number, number]; at?: [number, number]; y?: number}> = ({size = [120, 120], at = [0, 0], y = 0, receive = true, ...m}) =>
  <mesh position={[at[0], y, at[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={receive}><planeGeometry args={size} /><M {...m} /></mesh>;

// ------------------------------------------------------------------------------------------------ light
export type Light = {
  sun?: V3;            // direction FROM the scene TOWARD the sun (e.g. [-4, 6, 3] = high, from the left-front)
  sunColor?: string; sunI?: number;
  sky?: string; bounce?: string; ambI?: number;         // hemisphere fill: sky colour from above, bounce colour from the ground
  fog?: [string, number, number];                        // aerial perspective: [colour, near, far]
  focus?: V3; span?: number;                             // shadow-map area: centre and half-width in metres (keep it tight for crisp shadows)
};
/** shadow-map size (the depth pass is drawn every frame; 1024 keeps it cheap on software WebGL and still crisp at span 12;
 *  2048 on the PC detail level for sharper shadows on a GPU) */
export const SHADOW_MAP = lvl(1024, 2048);
const LIGHT: Required<Light> = {sun: [-4, 7, 4], sunColor: '#FFF3DC', sunI: 2.4, sky: '#DCEBFF', bounce: '#B9A894', ambI: 1.25, fog: ['#DDE8F5', 30, 140], focus: [0, 0, 0], span: 14};
type Sync = {done: number; pending: number | null};
const Rig: React.FC<{cam: Cam3; light: Required<Light>; shadows: boolean; frame: number; sync: React.MutableRefObject<Sync>}> = ({cam, light, shadows, frame, sync}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera; const advance = useThree((s) => s.advance);
  // exactly ONE synchronous 3D draw per video frame, after this frame's scene is committed; then release the frame.
  // (A free-running render loop fights the frame capture: ~10x slower on software WebGL, and not deterministic.)
  useLayoutEffect(() => { advance(frame / 60); sync.current.done = frame; if (sync.current.pending !== null) { continueRender(sync.current.pending); sync.current.pending = null; } });
  camera.fov = cam.fov; camera.aspect = W / H; camera.near = 0.1; camera.far = 400;
  camera.position.set(...cam.pos); camera.lookAt(...cam.look); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const sun = useMemo(() => new THREE.DirectionalLight(), []);
  const d = new THREE.Vector3(...light.sun).normalize().multiplyScalar(50);
  sun.color.set(light.sunColor); sun.intensity = light.sunI; sun.position.set(light.focus[0] + d.x, light.focus[1] + d.y, light.focus[2] + d.z); sun.target.position.set(...light.focus);
  sun.castShadow = shadows; const sc = sun.shadow.camera; sc.left = sc.bottom = -light.span; sc.right = sc.top = light.span; sc.near = 1; sc.far = 120; sc.updateProjectionMatrix();
  sun.shadow.mapSize.set(SHADOW_MAP, SHADOW_MAP); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 5;
  return (<>
    <primitive object={sun} /><primitive object={sun.target} />
    <hemisphereLight args={[light.sky, light.bounce, light.ambI]} />
    <fog attach="fog" args={light.fog} />
  </>);
};

// ------------------------------------------------------------------------------------------------ cels (flat characters)
const CamCtx = createContext<Cam3 | null>(null);
/** render resolution multiplier for the 3D canvas (Short2K sets 4/3 so the world is drawn at true 1440x2560) */
export const ResCtx = createContext(1);
export type CelProps = {at: V3; h?: number; unitsTall?: number; flip?: boolean; shadow?: boolean; lift?: number; children?: React.ReactNode};
/** a flat 2D character (or any flat SVG drawing with its feet at (0,0)) standing at a 3D point. h = height in metres of
 *  `unitsTall` drawing units (Person = 430). Use inside <World>. It is drawn flat and unshaded; the world gives it a
 *  ground shadow (set shadow={false} for things that float). lift = metres above the floor (jump, climb). */
export const Cel: React.FC<CelProps> = ({at, h = 1.7, unitsTall = 430, flip = false, lift = 0, children}) => {
  const cam = useContext(CamCtx); if (!cam) return null;
  const p = toScreen(cam, [at[0], at[1] + lift, at[2]]); if (!p) return null;
  const sc = p.s * h / unitsTall;
  return <g transform={`translate(${p.x} ${p.y}) scale(${flip ? -sc : sc} ${sc})`}><KScale k={Math.max(sc, 0.5)}>{children}</KScale></g>;
};
/** (cels under 0.8 m - animals, small props - get only the soft contact blob: one draw call instead of five; a flock
 *  of 30 birds with full stand-ins was 150 extra meshes)
 *  invisible stand-in that makes a cel cast a real ground shadow (head disc + body + legs) plus a soft contact blob */
const CelShadow: React.FC<{at: V3; h: number; lift: number; sun: V3}> = ({at, h, lift, sun}) => {
  const yaw = Math.atan2(sun[0], sun[2]);                       // face the flat stand-in toward the sun
  const hide = <meshBasicMaterial colorWrite={false} depthWrite={false} />;
  return (<group>
    <mesh position={[at[0], at[1] + 0.012, at[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.62, 1]} renderOrder={2}>
      <circleGeometry args={[0.36 * h * clamp(1 - lift / (1.2 * h), 0.35, 1), 32]} /><meshBasicMaterial map={blob()} transparent opacity={0.42 * clamp(1 - lift / (1.5 * h), 0.3, 1)} depthWrite={false} color="#1A1420" />
    </mesh>
    {h >= 0.8 && <group position={[at[0], at[1] + lift, at[2]]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.767 * h, 0]} scale={[1, 1, 0.08]} castShadow>{hide}<sphereGeometry args={[0.235 * h, 24, 16]} /></mesh>
      <mesh position={[0, 0.41 * h, 0]} castShadow>{hide}<boxGeometry args={[0.2 * h, 0.27 * h, 0.02]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.06 * h, 0.135 * h, 0]} castShadow>{hide}<boxGeometry args={[0.022 * h, 0.27 * h, 0.02]} /></mesh>)}
    </group>}
  </group>);
};

const Canvas3: React.FC<{cam: Cam3; light: Required<Light>; shadows: boolean; dpr: number; children?: React.ReactNode}> = ({cam, light, shadows, dpr, children}) => {
  const frame = useCurrentFrame(); const sync = useRef<Sync>({done: -1, pending: null});
  useLayoutEffect(() => { if (sync.current.done !== frame && sync.current.pending === null) sync.current.pending = delayRender('3D frame ' + frame); });
  useLayoutEffect(() => () => { if (sync.current.pending !== null) continueRender(sync.current.pending); }, []);
  return (
    <ThreeCanvas width={W} height={H} dpr={dpr} flat frameloop="never" shadows={shadows} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}} style={{position: 'absolute', left: 0, top: 0}}>
      <Rig cam={cam} light={light} shadows={shadows} frame={frame} sync={sync} />{children}
    </ThreeCanvas>);
};

// ------------------------------------------------------------------------------------------------ the shot
export type WorldProps = {
  cam: Cam3; light?: Light; sky?: [string, string];      // sky = [top, horizon] gradient behind the 3D scene (use a wall colour pair indoors)
  scene: React.ReactNode;                                 // 3D meshes: the whole set and its props
  front?: React.ReactNode;                                // 3D meshes that must pass IN FRONT of the flat characters (a table edge, a doorframe, a held prop)
  children?: React.ReactNode;                             // <Cel> characters (any order; sorted far -> near here) and other SVG drawn over the world
};
export const World: React.FC<WorldProps> = ({cam, light, sky = ['#8CC6FF', '#DDEBFA'], scene, front, children}) => {
  const L = {...LIGHT, ...light}; const res = useContext(ResCtx);
  const dpr = res * (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  const kids = React.Children.toArray(children) as React.ReactElement[];
  const cels = kids.filter((k) => k.type === Cel), rest = kids.filter((k) => k.type !== Cel);
  const depthOf = (k: React.ReactElement) => toScreen(cam, (k.props as CelProps).at)?.depth ?? 0;
  const sorted = [...cels].sort((a, b) => depthOf(b) - depthOf(a));
  const canvas = (body: React.ReactNode, shadows: boolean) => <Canvas3 cam={cam} light={L} shadows={shadows} dpr={dpr}>{body}</Canvas3>;
  return (
    <AbsoluteFill style={{background: `linear-gradient(${sky[0]} 0%, ${sky[1]} 62%)`}}>
      {canvas(<>{scene}{front}{cels.map((k, i) => { const p = k.props as CelProps; return p.shadow === false ? null : <CelShadow key={i} at={p.at} h={p.h ?? 1.7} lift={p.lift ?? 0} sun={L.sun} />; })}</>, true)}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <CamCtx.Provider value={cam}>{sorted}{rest}</CamCtx.Provider>
      </svg>
      {front ? canvas(front, false) : null}
    </AbsoluteFill>);
};

// ------------------------------------------------------------------------------------------------ editing
/** clean cut: the shot whose start time is the last one at or before t.  shots = [[start, node], ...] */
export const Cuts: React.FC<{t: number; shots: [number, React.ReactNode][]}> = ({t, shots}) => { let n = shots[0][1]; for (const [s, node] of shots) if (t >= s) n = node; return <>{n}</>; };
/** short dissolve between two shots, centred on `at` (0.25-0.4 s). Use rarely: time passing, a place change that is not a reveal. */
export const Dissolve: React.FC<{t: number; at: number; dur?: number; a: React.ReactNode; b: React.ReactNode}> = ({t, at, dur = 0.3, a, b}) => {
  if (t <= at - dur / 2) return <>{a}</>; if (t >= at + dur / 2) return <>{b}</>;
  return <><AbsoluteFill>{a}</AbsoluteFill><AbsoluteFill style={{opacity: smooth((t - (at - dur / 2)) / dur)}}>{b}</AbsoluteFill></>;
};
