// SCALE=2 node tools/thumbs.mjs A B C -> thumbnails/thumb_<v>.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path'; import fs from 'fs';
const CANDS = [process.env.BROWSER, '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'];
const browserExecutable = CANDS.find((p) => p && fs.existsSync(p)) || null;   // null = Remotion downloads / uses its own
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('.bundle')});
for (const v of process.argv.slice(2)) {
  const c = await selectComposition({serveUrl, id: 'Thumb', inputProps: {variant: v}, browserExecutable});
  await renderStill({serveUrl, composition: c, frame: 0, output: `thumbnails/thumb_${v}.png`, scale: Number(process.env.SCALE || 2), inputProps: {variant: v}, browserExecutable});
}
console.log('done');
