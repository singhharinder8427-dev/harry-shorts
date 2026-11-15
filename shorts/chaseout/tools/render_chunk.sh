#!/usr/bin/env bash
# tools/render_chunk.sh <from> <to> : video-only 2K chunk -> out/chunks/c_<from>.mp4
set -euo pipefail
mkdir -p out/chunks
npx remotion render src/index.ts Short2K "out/chunks/c_$(printf %05d $1).mp4" --frames="$1-$2" --muted --props='{"voice":true,"captions":true}' \
  --image-format=jpeg --jpeg-quality=95 --crf=17 --pixel-format=yuv420p --concurrency=4 --gl=swangle \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
