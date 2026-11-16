# What if it rained for 100 years straight? (rain100)
Final: `out/rain100-2K.mp4` (1440x2560, 60 fps, 40.43 s, -13.9 LUFS). Thumbnails: `thumbnails/thumb_A/B/C.jpg`. Metadata: `youtube.md`.

## Script
See `voiceover/script.txt` (119 words, take by the user, aligned with `voiceover/word_times.json`).

## Sources
- The global atmospheric water cycle (IOP): https://iopscience.iop.org/article/10.1088/1748-9326/5/2/025202
- Volume of Earth's annual precipitation: https://hypertextbook.com/facts/2008/VernonWu.shtml
- Water cycle / residence time: https://windows2universe.org/earth/Water/water_cycle_climate_change.html
Read through search summaries only. "About forty times a year", "three and a half feet" and "340 feet" are arithmetic from the averages (about 1,050 mm of rain a year, about 26 mm of water in the air, about 9 days residence), not measured results.

## Re-run with a new take
`tools/retime.sh path/to/new_take.mp3` (copy the take somewhere other than voiceover/take/). `RENDER=0` skips the 2K render.
Preview: `npx remotion render src/index.ts Short out/preview.mp4 --scale=0.5 --gl=swangle`.
