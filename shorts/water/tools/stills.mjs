// node tools/stills.mjs t1 t2 ...  -> qa/still_<t>.png  (env COMP, SCALE)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path'; import fs from 'fs';
const comp = process.env.COMP || 'Water', scale = Number(process.env.SCALE || 0.5);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('.bundle')});
const props = JSON.parse(process.env.PROPS || '{}');
const c = await selectComposition({serveUrl, id: comp, inputProps: props, browserExecutable});
fs.mkdirSync('qa', {recursive: true});
for (const a of process.argv.slice(2)) {
  const frame = Math.min(c.durationInFrames - 1, Math.round(Number(a) * c.fps));
  await renderStill({serveUrl, composition: c, frame, output: `qa/still_${Number(a).toFixed(2).padStart(6, '0')}.png`, scale, inputProps: props, browserExecutable});
}
console.log('done');
