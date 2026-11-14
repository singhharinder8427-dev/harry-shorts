#!/usr/bin/env bash
# tools/retime.sh path/to/take.mp3
# aligns the take to the script, re-times every beat, rebuilds sfx / timing sheet / captions, renders the 2K Short.
set -euo pipefail
TAKE="$1"
SHORT=$(python3 -c "import json;print(json.load(open('story.json'))['short'])")
ALIGNPY="${ALIGNPY:-/tmp/alignenv/bin/python}"
if [ ! -x "$ALIGNPY" ]; then python3 -m venv /tmp/alignenv && /tmp/alignenv/bin/pip -q install pocketsphinx numpy; ALIGNPY=/tmp/alignenv/bin/python; fi
mkdir -p voiceover/take "public/$SHORT" out
ext="${TAKE##*.}"; cp "$TAKE" "voiceover/take/take.$ext"
"$ALIGNPY" tools/align_take.py "voiceover/take/take.$ext" voiceover/script.txt voiceover/take/word_times.json
python3 tools/gen_timing.py story.json --take voiceover/take/word_times.json --out src/timing.json
ffmpeg -loglevel error -y -i "voiceover/take/take.$ext" -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 -ac 1 "public/$SHORT/vo.wav"
python3 tools/gen_sfx.py && python3 tools/gen_sheet.py && python3 tools/make_captions.py
if [ "${RENDER:-1}" = "1" ]; then
  npx remotion render src/index.ts Short2K "out/$SHORT-2K.mp4" --props='{"voice":true,"captions":true}' \
    --image-format=jpeg --jpeg-quality=95 --crf=17 --pixel-format=yuv420p --concurrency="${CONC:-$(nproc)}"
fi
