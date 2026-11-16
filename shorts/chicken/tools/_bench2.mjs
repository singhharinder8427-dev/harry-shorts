import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'path';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const chromiumOptions = {gl: 'swangle'};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('.bundle')});
const [a, b] = (process.env.RANGE || '60,99').split(',').map(Number);
for (const variant of (process.env.VARS || 'full').split(',')) {
  const props = {bench: variant};
  const c = await selectComposition({serveUrl, id: process.env.COMP || 'Short', inputProps: props, browserExecutable, chromiumOptions});
  const t0 = Date.now();
  await renderMedia({serveUrl, composition: c, codec: 'h264', outputLocation: '/tmp/claude-0/-home-user-harry-shorts/f8a76095-835c-5b17-b090-2c46e4b77af2/scratchpad/b.mp4', frameRange: [a, b],
    scale: Number(process.env.SCALE || 0.5), concurrency: Number(process.env.CONC || 1), inputProps: {...props, voice: false}, browserExecutable, chromiumOptions, muted: true, crf: 20, imageFormat: process.env.IMG || 'jpeg'});
  console.log(variant, 'conc', process.env.CONC || 1, ((Date.now() - t0) / (b - a + 1) / 1000).toFixed(3), 's/frame');
}
