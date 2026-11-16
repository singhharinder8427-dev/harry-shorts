import {Config} from '@remotion/cli/config';
import fs from 'fs';
// Cloud sandbox: use the pre-installed headless Chromium when present; otherwise Remotion fetches its own.
const CANDS = [process.env.BROWSER, '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'];
const b = CANDS.find((p) => p && fs.existsSync(p));
if (b) Config.setBrowserExecutable(b);
Config.setVideoImageFormat('jpeg');
// v3: the world is real 3D (WebGL). GL=angle on a machine with a GPU; the default software renderer works everywhere.
Config.setChromiumOpenGlRenderer((process.env.GL as any) || 'swangle');
