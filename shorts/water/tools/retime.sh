#!/usr/bin/env bash
# tools/retime.sh path/to/take.mp3  -> aligns the take, re-times every beat, rebuilds sfx, renders the 4K Short
set -euo pipefail
TAKE="$1"; ALIGNPY="${ALIGNPY:-/tmp/claude-0/-home-user/0ee4114f-f412-52fc-be4e-7fb3977c6a6c/scratchpad/alignenv/bin/python}"
if [ ! -x "$ALIGNPY" ]; then python3 -m venv /tmp/alignenv && /tmp/alignenv/bin/pip -q install pocketsphinx numpy; ALIGNPY=/tmp/alignenv/bin/python; fi
mkdir -p voiceover/take && cp "$TAKE" voiceover/take/take.mp3
"$ALIGNPY" tools/align_take.py voiceover/take/take.mp3 voiceover/script.txt voiceover/take/word_times.json
python3 tools/gen_timing.py story.json --take voiceover/take/word_times.json --out src/timing.json
ffmpeg -loglevel error -y -i voiceover/take/take.mp3 -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 -ac 1 public/water/vo.wav
python3 tools/gen_sfx.py && python3 tools/gen_sheet.py
npx remotion render src/index.ts Water2K out/water-short-2K.mp4 --props='{"voice":true,"captions":true}' \
  --image-format=jpeg --jpeg-quality=95 --crf=17 --pixel-format=yuv420p --concurrency=4
