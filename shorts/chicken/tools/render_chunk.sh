#!/usr/bin/env bash
# tools/render_chunk.sh <first> <last> : one silent 2K chunk (cloud jobs stop at their time limit, so render ~1100 frames at a time)
set -euo pipefail
npx remotion render src/index.ts Short2K "out/chunk_$1.mp4" --frames="$1-$2" --muted --props='{"voice":true,"captions":true}' \
  --image-format=jpeg --jpeg-quality=95 --crf=17 --pixel-format=yuv420p --concurrency=2 --gl=swangle \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
