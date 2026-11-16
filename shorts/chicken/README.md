# chicken: "One chicken explains why the rich get richer"

Made with **harry-animator v3**: a flat 2D cel cast in a stylized 3D world. Length limit for this video: 55 s, the user's choice.
The script is version 3 of five, "story with characters", based on the user's own pasted parable. It was fact-checked and reworded.

- Script: `voiceover/script.txt` (143 words, about 51.5 s estimated). Timing sheet for the voice take: `voiceover/TIMING_SHEET.md`.
- Cast: Blob (fixed brand character), Ned (first neighbour, `role('friend', 'chicken-a')`), Sara (second neighbour,
  `role('friend', 'chicken')`), and flat chickens (`src/Birds.tsx`).
- Set: one code-built 3D village seen at every time of day (`src/Village.tsx`).
- Scenes: `src/Short.tsx`, about 30 pictures, one per caption phrase. Each shot's style card is in `story.json`.
- Sound: `tools/gen_sfx.py` builds the effects and music bed from the word times.
- Title, description and tags: `youtube.md`. Thumbnails: `thumbnails/thumb_A/B/C.jpg`. A is recommended.

**Final:** `out/chicken-2K.mp4` is re-timed to the voice take (54.4 s). It is 1440x2560 at 60 fps with 3,263 frames, the mix is mastered to -14.0 LUFS (true peak -1.5 dBTP), and the music bed leaves no silent gaps.
It was rendered in three silent chunks (`tools/render_chunk.sh`), because a cloud background job stops after 2 h, then joined, mixed and mastered with `tools/join_chunks.sh`.
The video has two storytelling passes: v1 had one picture per caption phrase; v2 adds a flash-forward hook, mood colours, the explanation split and the three-way finale.

For a new voice take, run:

```bash
tools/retime.sh path/to/take.mp3
```

This aligns the take, re-times every beat, rebuilds the sound and captions, and renders `out/chicken-2K.mp4`.
Rendering takes about 0.35 s per frame on 4 cores without a GPU, so roughly 20-35 min.

## Speed notes (learned on this video)
- Several parallel tabs give no speedup with software WebGL, because SwiftShader already uses every core. Measured:
  conc 1 = 0.31, conc 2 = 0.32, conc 4 = 0.34 s/frame.
- The cost depends on the number of separate textured meshes, not on resolution: 0.5x and 1x differ by about 12 %.
  Repeated things (coins, clouds, tree crowns, hills, leaves, wheat) are instanced (`Instances` in `Village.tsx`).
  Small cels (chickens) get only a contact-shadow blob.
- Benchmark one still at a time and every still loads a fresh page, re-uploading every texture. That made per-still
  numbers about 7x the real per-frame cost. Use `tools/_bench2.mjs`, which renders 40 frames with `renderMedia`.

## Facts the voice states (checked)
- Chicken eggs hatch after about 21 days ("three weeks"). Sources: University of Nebraska-Lincoln Extension and
  Oklahoma State University incubation fact sheets.
- Young hens start laying at about 18-20 weeks ("about five months"). Source: Oregon State University Extension.
  Heritage breeds can take longer.
- Hens lay without a rooster, but a rooster is needed for eggs that hatch. Source: Extension.org / 4-H.
- The story is a parable about one cause of inequality (wealth that multiplies versus wealth that gets used up). It
  does not claim to be the only cause. The YouTube description says so.
