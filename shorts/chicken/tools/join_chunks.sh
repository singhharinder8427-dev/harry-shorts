#!/usr/bin/env bash
# tools/join_chunks.sh : join the silent 2K chunks, mix voice + sfx + bed exactly as Short.tsx does, master to -14 LUFS
set -euo pipefail
S=$(python3 -c "import json;print(json.load(open('story.json'))['short'])")
OFF=$(python3 -c "import json;t=json.load(open('src/timing.json'));print(max(0,round(t['voiceOffset']*60)/60))")
DUR=$(python3 -c "import json;print(json.load(open('src/timing.json'))['duration'])")
ls out/chunk_*.mp4 | sort -t_ -k2 -n | sed "s/^/file '/;s/$/'/" | sed "s#file 'out/#file '#" > out/chunks.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i out/chunks.txt -c copy out/video_silent.mp4
MS=$(python3 -c "print(int(round($OFF*1000)))")
ffmpeg -loglevel error -y -i "public/$S/vo.wav" -i "public/$S/sfx.wav" -i "public/$S/bed.wav" -filter_complex \
  "[0:a]adelay=${MS}|${MS},volume=1[v];[1:a]volume=0.42[s];[2:a]volume=0.2[b];[v][s][b]amix=inputs=3:normalize=0:duration=longest,atrim=0:${DUR}[a]" \
  -map "[a]" -ar 48000 -ac 2 out/mix.wav
ffmpeg -loglevel error -y -i out/video_silent.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest "out/$S-2K.raw.mp4"
python3 tools/master_audio.py "out/$S-2K.raw.mp4" "out/$S-2K.mp4" && rm "out/$S-2K.raw.mp4" out/video_silent.mp4 out/mix.wav
echo "out/$S-2K.mp4"
