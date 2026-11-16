#!/bin/bash
# Resumable render: renders the video in small chunks, keeps every finished chunk on disk, retries a failed chunk,
# and on a re-run skips every chunk that is already complete - so a crash resumes from the failure point.
#   tools/render_resumable.sh [out.mp4]      env: COMP=Short SCALE=0.5 CHUNK=120 CONC=4 TRIES=6 VOICE=0
# Chunks are rendered silent (--muted); the sound (sfx + bed [+ voice]) is mixed in and attached at the end.
set -u
cd "$(dirname "$0")/.."
OUT=${1:-out/preview.mp4}; COMP=${COMP:-Short}; SCALE=${SCALE:-0.5}; CHUNK=${CHUNK:-120}; CONC=${CONC:-4}; TRIES=${TRIES:-6}; VOICE=${VOICE:-0}
SHORT=$(python3 -c "import json;print(json.load(open('src/timing.json'))['short'])")
DUR=$(python3 -c "import json;print(json.load(open('src/timing.json'))['duration'])")
N=$(python3 -c "print(round($DUR*60))")
DIR=out/chunks_${COMP}_${SCALE}; mkdir -p "$DIR"
# a timing change invalidates old chunks (the picture depends on it)
SIG=$(md5sum src/timing.json src/Short.tsx | md5sum | cut -c1-12)
[ "$(cat $DIR/.sig 2>/dev/null)" = "$SIG" ] || { rm -f $DIR/*.mp4; echo "$SIG" > $DIR/.sig; }
LOG=$DIR/render.log
ok() { [ -s "$1" ] && [ "$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nw=1:nk=1 "$1" 2>/dev/null)" = "$2" ]; }
done_n=0; total=$(( (N + CHUNK - 1) / CHUNK ))
for ((s=0; s<N; s+=CHUNK)); do
  e=$((s+CHUNK-1)); [ $e -ge $N ] && e=$((N-1)); want=$((e-s+1)); f=$(printf "$DIR/c_%05d.mp4" $s)
  if ok "$f" $want; then echo "chunk $s-$e already done"; continue; fi
  for ((a=1; a<=TRIES; a++)); do
    rm -f "$f"
    npx remotion render src/index.ts $COMP "$f" --scale=$SCALE --crf=18 --concurrency=$CONC --frames=$s-$e --muted >> $LOG 2>&1
    if ok "$f" $want; then echo "chunk $s-$e done (try $a)"; break; fi
    echo "chunk $s-$e failed (try $a), retrying"; sleep 3
  done
  ok "$f" $want || { echo "GAVE UP on chunk $s-$e - run again to resume"; exit 1; }
done
# join the chunks
ls $DIR/c_*.mp4 | sed "s|.*/|file '|; s|\$|'|" > $DIR/list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i $DIR/list.txt -c copy $DIR/video.mp4 || exit 1
# sound: sfx 0.42 + bed 0.2 (+ the voice at its offset), as the composition would play it
INP="-i public/$SHORT/sfx.wav -i public/$SHORT/bed.wav"; FIL="[1:a]volume=0.42[a0];[2:a]volume=0.2[a1]"; MIX="[a0][a1]"; CNT=2
if [ "$VOICE" = "1" ]; then
  OFF=$(python3 -c "import json;print(max(0,json.load(open('src/timing.json'))['voiceOffset']))")
  INP="$INP -i public/$SHORT/vo.wav"; FIL="$FIL;[3:a]adelay=$(python3 -c "print(int($OFF*1000))")|$(python3 -c "print(int($OFF*1000))")[a2]"; MIX="$MIX[a2]"; CNT=3
fi
ffmpeg -y -loglevel error -i $DIR/video.mp4 $INP -filter_complex "$FIL;${MIX}amix=inputs=$CNT:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t $DUR "$OUT" || exit 1
echo "DONE $OUT"
