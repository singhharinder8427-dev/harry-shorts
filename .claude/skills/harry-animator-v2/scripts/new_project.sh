#!/usr/bin/env bash
# new_project.sh <project-dir> <short-name> [--example]   (run from anywhere; SKILL = this skill folder)
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"; P="$1"; NAME="$2"
mkdir -p "$P"/{tools,voiceover,src,"public/$NAME",qa,out,thumbnails}
cp -r "$SKILL/templates/remotion/." "$P/"
cp "$SKILL"/scripts/{gen_timing.py,align_take.py,sfxlib.py,gen_sheet.py,make_captions.py,stills.mjs,sheet.py,thumbs.mjs,qa_video.py,retime.sh,master_audio.py} "$P/tools/"
chmod +x "$P/tools/retime.sh"
if [ "${3:-}" = "--example" ]; then
  cp "$SKILL"/examples/water/{Short.tsx,Earth.tsx,timing.json} "$P/src/"; cp "$SKILL/examples/water/story.json" "$P/"
  cp "$SKILL/examples/water/script.txt" "$P/voiceover/"; cp "$SKILL/examples/water/gen_sfx.py" "$P/tools/"
  sed -i "s/\"short\": \"water\"/\"short\": \"$NAME\"/" "$P/story.json" "$P/src/timing.json"
fi
mkdir -p "$P/reference" && cp "$SKILL/examples/v2-demo/Short.tsx" "$P/reference/v2-demo-Short.tsx"
cd "$P" && npm install --no-audit --no-fund --loglevel=error
command -v ffmpeg >/dev/null || echo "WARNING: ffmpeg not found (needed for voice loudness + QA)"
python3 -c "import numpy, PIL, cv2" 2>/dev/null || pip install -q numpy pillow opencv-python-headless
echo "project ready: $P"
