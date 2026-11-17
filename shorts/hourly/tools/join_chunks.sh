#!/usr/bin/env bash
# tools/join_chunks.sh : join the silent Full HD chunks (out/chunk_<first>.mp4), mix voice + sfx + bed exactly as Short.tsx does
# (voice at voiceOffset, sfx 0.42, bed 0.2 - change here if your Short.tsx volumes differ), master to -14 LUFS.
# No -shortest when muxing: it cut the last frames (the AAC stream starts with priming samples).
set -euo pipefail
PY=python3; "$PY" -c 1 2>/dev/null || PY=python   # Windows: python3 is often only a Store alias
S=$("$PY" -c "import json;print(json.load(open('story.json'))['short'])")
OFF=$("$PY" -c "import json;t=json.load(open('src/timing.json'));print(max(0,round(t['voiceOffset']*30)/30))")
DUR=$("$PY" -c "import json;print(json.load(open('src/timing.json'))['duration'])")
ls out/chunk_*.mp4 | sort -t_ -k2 -n | sed "s/^/file '/;s/$/'/" | sed "s#file 'out/#file '#" > out/chunks.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i out/chunks.txt -c copy out/video_silent.mp4
MS=$("$PY" -c "print(int(round($OFF*1000)))")
ffmpeg -loglevel error -y -i "public/$S/vo.wav" -i "public/$S/sfx.wav" -i "public/$S/bed.wav" -filter_complex \
  "[0:a]adelay=${MS}|${MS},volume=1[v];[1:a]volume=0.42[s];[2:a]volume=0.2[b];[v][s][b]amix=inputs=3:normalize=0:duration=longest,atrim=0:${DUR}[a]" \
  -map "[a]" -ar 48000 -ac 2 out/mix.wav
ffmpeg -loglevel error -y -i out/video_silent.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k "out/$S-1080p.raw.mp4"
"$PY" tools/master_audio.py "out/$S-1080p.raw.mp4" "out/$S-1080p.mp4" && rm "out/$S-1080p.raw.mp4" out/video_silent.mp4 out/mix.wav
echo "out/$S-1080p.mp4"
