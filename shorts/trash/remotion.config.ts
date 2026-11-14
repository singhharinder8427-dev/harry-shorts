import {Config} from '@remotion/cli/config';
import fs from 'fs';
// Cloud sandbox: use the pre-installed headless Chromium when present; otherwise Remotion fetches its own.
const CANDS = [process.env.BROWSER, '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'];
const b = CANDS.find((p) => p && fs.existsSync(p));
if (b) Config.setBrowserExecutable(b);
Config.setVideoImageFormat('jpeg');
