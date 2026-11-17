#!/usr/bin/env bash
# tools/render_chunk.sh <first> <last> : one silent 2K chunk. A cloud background job stops at its time limit (2 h), and a
# rich set renders at ~1.8-3.3 s per 2K frame, so render ~1100 frames per job, one job after the other; then join_chunks.sh.
set -euo pipefail
B=""; for p in "${BROWSER:-}" /opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell; do [ -n "$p" ] && [ -x "$p" ] && { B="--browser-executable=$p"; break; }; done
npx remotion render src/index.ts Short2K "out/chunk_$1.mp4" --frames="$1-$2" --muted --props='{"voice":true,"captions":true}' \
  --image-format=jpeg --jpeg-quality=95 --crf=17 --pixel-format=yuv420p --concurrency="${CONC:-2}" --gl="${GL:-swangle}" $B
