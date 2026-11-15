#!/usr/bin/env bash
# tools/join_chunks.sh : join out/chunks/*.mp4 (video only) + mix voice/sfx/bed like the composition, master to -14 LUFS
set -euo pipefail
S=$(python3 -c "import json;print(json.load(open('story.json'))['short'])")
OFF=$(python3 -c "import json;print(int(round(json.load(open('src/timing.json'))['voiceOffset']*1000)))")
DUR=$(python3 -c "import json;print(json.load(open('src/timing.json'))['duration'])")
ls out/chunks/c_*.mp4 | sort | sed "s#^#file '$PWD/#; s#\$#'#" > out/chunks/list.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/video_only.mp4
ffmpeg -loglevel error -y -i "public/$S/vo.wav" -i "public/$S/sfx.wav" -i "public/$S/bed.wav" -filter_complex \
  "[0:a]adelay=${OFF}|${OFF},volume=1[v];[1:a]volume=0.42[s];[2:a]volume=0.2[b];[v][s][b]amix=inputs=3:normalize=0:duration=longest,atrim=0:${DUR},aformat=channel_layouts=stereo[a]" \
  -map "[a]" -ar 48000 out/mix.wav
ffmpeg -loglevel error -y -i out/video_only.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/$S-2K.raw.mp4
python3 tools/master_audio.py out/$S-2K.raw.mp4 out/$S-2K.mp4 && rm out/$S-2K.raw.mp4 out/video_only.mp4 out/mix.wav
