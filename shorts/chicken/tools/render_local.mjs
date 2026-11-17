#!/usr/bin/env node
// tools/render_local.mjs : render the Short on YOUR computer (Windows / macOS / Linux) instead of the cloud.
// Needs only Node 18+ (ffmpeg comes with Remotion). Run from the short's folder (the one with story.json):
//   node tools/render_local.mjs              -> out/<short>-2K.mp4  (1440x2560, 60 fps, mastered to -14 LUFS)
//   node tools/render_local.mjs --preview    -> out/preview.mp4     (half size, quick look)
//   node tools/render_local.mjs --frames=0-299   (first 5 s only, to time your machine -> out/<short>-2K-test-0-299.mp4)
// Videos are saved to D:\HarryShorts\renders\previews and ...\final on a Windows PC with a D: drive (else out/);
// set RENDER_DIR=<folder> to choose another place.
// Options (env): CONC=<n> parallel frames (default: 2 for 2K - more can run out of WebGL contexts; half your CPU
// threads for --preview), GL=angle|swangle|egl|vulkan
// (default: angle on Windows/macOS = uses your GPU; swangle on Linux), BROWSER=<path to Chrome> if the download fails.
// One render with audio, no chunks: the 2 h limit that forced chunks only exists in the cloud.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const arg = (k) => process.argv.find((a) => a === `--${k}` || a.startsWith(`--${k}=`));
const preview = !!arg('preview'), frames = arg('frames')?.split('=')[1];
const win = process.platform === 'win32', npx = win ? 'npx.cmd' : 'npx', npm = win ? 'npm.cmd' : 'npm';
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, {stdio: opts.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', encoding: 'utf8', shell: win});
  if (r.status !== 0 && !opts.ok) { console.error(`\nFAILED: ${cmd} ${args.join(' ')}\n${r.stderr ?? ''}`); process.exit(1); }
  return r;
};

if (!fs.existsSync('story.json') || !fs.existsSync('src/timing.json')) {
  console.error('Run this from the short\'s folder (it must contain story.json and src/timing.json).'); process.exit(1);
}
const [maj] = process.versions.node.split('.').map(Number);
if (maj < 18) { console.error(`Node ${process.versions.node} is too old - install Node 18 or newer (nodejs.org).`); process.exit(1); }
const S = JSON.parse(fs.readFileSync('story.json', 'utf8')).short;
const T = JSON.parse(fs.readFileSync('src/timing.json', 'utf8'));
const missing = ['vo.wav', 'sfx.wav'].map((f) => `public/${S}/${f}`).filter((f) => !fs.existsSync(f));
if (missing.length) {
  console.error(`Missing ${missing.join(', ')} - pull the latest version of the branch (git pull), or ask Claude to push the voice / sound files.`);
  process.exit(1);
}
if (!fs.existsSync('node_modules')) { console.log('Installing (first run only)...'); run(npm, ['install', '--no-audit', '--no-fund', '--loglevel=error']); }
fs.mkdirSync('out', {recursive: true});

// 2K: default 2 parallel frames - at 6 a Windows PC ran out of WebGL contexts ("Error creating WebGL context" at frame
// 265, 17 Nov test); 2 rendered at 0.14 s/frame. Preview (half size) is fine at half the CPU threads.
const threads = os.cpus().length;
const conc = process.env.CONC ?? (preview ? String(Math.max(1, Math.floor(threads / 2))) : '2');
const gl = process.env.GL ?? (process.platform === 'linux' ? 'swangle' : 'angle');
// Where videos go: RENDER_DIR if set; on Windows with a D: drive, D:\HarryShorts\renders (previews\ and final\);
// otherwise the short's out/ folder. A partial render (--frames) gets its own name so it never overwrites a finished video.
const tag = frames ? `-test-${frames}` : '';
const root = process.env.RENDER_DIR ?? (win && fs.existsSync('D:\\') ? 'D:\\HarryShorts\\renders' : null);
const dir = root ? path.join(root, preview ? 'previews' : 'final') : 'out';
fs.mkdirSync(dir, {recursive: true});
const raw = preview ? path.join(dir, `${S}-preview${tag}.mp4`) : `out/${S}-2K${tag}.raw.mp4`;
const dst = preview ? raw : path.join(dir, `${S}-2K${tag}.mp4`);
fs.writeFileSync('out/last_render_dir.txt', path.resolve(dir));
const nFrames = Math.round(T.duration * 60);
console.log(`Rendering ${preview ? 'preview (540x960)' : '2K (1440x2560)'} - ${frames ?? `${nFrames} frames`} - ${threads} CPU threads, concurrency ${conc}, gl ${gl}`);
// props go through a file: on Windows (shell: true) inline JSON loses its quotes and Remotion rejects it
const propsFile = path.join('out', 'render_props.json');
fs.writeFileSync(propsFile, JSON.stringify({voice: true, captions: true}));
const t0 = Date.now();
run(npx, ['remotion', 'render', 'src/index.ts', preview ? 'Short' : 'Short2K', raw,
  `--props=${propsFile}`, ...(preview ? ['--scale=0.5', '--crf=20'] : ['--crf=17', '--image-format=jpeg', '--jpeg-quality=95']),
  '--pixel-format=yuv420p', `--concurrency=${conc}`, `--gl=${gl}`, ...(frames ? [`--frames=${frames}`] : []),
  ...(process.env.BROWSER ? [`--browser-executable=${process.env.BROWSER}`] : [])]);
const secs = (Date.now() - t0) / 1000, done = frames ? frames.split('-').reduce((a, b) => +b - +a + 1) : nFrames;
console.log(`Rendered in ${(secs / 60).toFixed(1)} min (${(secs / done).toFixed(2)} s per frame).`);

if (!preview) {   // two-pass loudness master to -14 LUFS, true peak -1 dBTP, video copied untouched (= master_audio.py)
  const lf = 'loudnorm=I=-14:TP=-1.0:LRA=9';
  const m1 = run(npx, ['remotion', 'ffmpeg', '-hide_banner', '-i', raw, '-vn', '-af', `${lf}:print_format=json`, '-f', 'null', '-'], {capture: true}).stderr;
  const m = JSON.parse(m1.slice(m1.lastIndexOf('{'), m1.lastIndexOf('}') + 1));
  run(npx, ['remotion', 'ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-c:v', 'copy', '-af',
    `${lf}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', dst]);
  fs.rmSync(raw);
  console.log(`Mastered audio (input ${m.input_i} LUFS -> -14 LUFS).`);
}
const p = run(npx, ['remotion', 'ffprobe', '-v', 'error', '-count_packets', '-show_entries',
  'stream=codec_type,width,height,r_frame_rate,nb_read_packets,duration', '-of', 'json', dst], {capture: true, ok: true});
try {
  const st = JSON.parse(p.stdout).streams, v = st.find((s) => s.codec_type === 'video'), a = st.find((s) => s.codec_type === 'audio');
  console.log(`\nDONE: ${dst}\n  ${v.width}x${v.height}, ${v.r_frame_rate} fps, ${v.nb_read_packets} frames (expected ${frames ? done : nFrames}), ` +
    `${(+v.duration).toFixed(2)} s, audio ${a ? `${(+a.duration).toFixed(2)} s` : 'MISSING'}`);
} catch { console.log(`\nDONE: ${dst}`); }
console.log('Watch it once with sound. Then send the file back to Claude (upload it) for the final check.');
