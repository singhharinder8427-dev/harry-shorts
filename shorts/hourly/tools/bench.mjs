// node tools/bench.mjs  (env RANGE=a,b  COMP=Short|Short2K  SCALE=0.5  CONC=1) -> real seconds per frame on a short range.
// Use THIS to measure render speed, not stills: every renderStill loads a fresh page and re-uploads every texture,
// which made per-still numbers ~7x the real per-frame cost on the chicken Short.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'path'; import fs from 'fs'; import os from 'os';
const CANDS = [process.env.BROWSER, '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'];
const browserExecutable = CANDS.find((p) => p && fs.existsSync(p)) || null;
const chromiumOptions = {gl: process.env.GL || 'swangle'};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('.bundle')});
const [a, b] = (process.env.RANGE || '60,99').split(',').map(Number);
const props = {voice: false};
const c = await selectComposition({serveUrl, id: process.env.COMP || 'Short', inputProps: props, browserExecutable, chromiumOptions});
const t0 = Date.now();
await renderMedia({serveUrl, composition: c, codec: 'h264', outputLocation: path.join(os.tmpdir(), 'bench.mp4'), frameRange: [a, b], muted: true, crf: 20,
  scale: Number(process.env.SCALE || 0.5), concurrency: Number(process.env.CONC || 1), inputProps: props, browserExecutable, chromiumOptions});
console.log(`${process.env.COMP || 'Short'} scale ${process.env.SCALE || 0.5} conc ${process.env.CONC || 1}: ${((Date.now() - t0) / (b - a + 1) / 1000).toFixed(3)} s/frame (frames ${a}-${b})`);
