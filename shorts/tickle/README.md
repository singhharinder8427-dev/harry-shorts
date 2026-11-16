# tickle: "Why can't you tickle yourself?"

Made with **harry-animator v3**: a flat 2D cel cast in a stylized 3D world. Length limit: 45 s (the user's choice).
Route: "find a viral topic". The script is variant 1 of five ("curious / what-if"), picked by the user.

- Script: `voiceover/script.txt` (115 words, about 41.7 s estimated). Timing sheet for the voice take: `voiceover/TIMING_SHEET.md`.
- Cast: Blob (fixed brand character), Nia (`role('friend', 'tickle')`), Dr Ray (`role('scientist', 'tickle')`).
- Sets (`src/Sets.tsx`): the living room (afternoon, golden hour, grey copy for the split stage), the brain space
  (3D brain, nerve cable, 3D hand, prediction bubble with a feather), the London lab at dusk (two robot arms, control box with
  dial and tickle gauge, rainy window with a clock tower).
- Scenes: `src/Short.tsx`, 18 shots, a new event on every caption phrase. Each shot's style card is in `story.json`.
- Storytelling: flash-forward hook (Nia tickling Blob, frame 0 = last frame), grey "nothing happens", fly-through into the head,
  the side-by-side "why" stage (self-tickle with a dim brain vs. a friend's tickle with a glowing brain), a golden finale.
- Accents: flash rewind, slam zoom, fly-through, smear cut, cerebellum punch-in, whip to the gauge, whip across the split stage.
- Pop-up card: `1/5 of a second` on "a fifth of a second".
- Sound: `tools/gen_sfx.py` (laughs, brushing, robot servos, rain, nerve pulses, CTA) + a code-made music bed.
- Title, description, tags: `youtube.md`. Thumbnails: `thumbnails/thumb_A/B/C.jpg`. A is recommended.

## Facts and sources
- Self-produced touch is rated less ticklish than an identical robot touch, and touch areas plus the cerebellum respond less
  (Blakemore, Wolpert & Frith 1998, Nature Neuroscience 1:635). A delay of up to 200 ms made it feel more tickly; longer
  delays, more tickly (1998; extended to 300 ms in 1999, J. Cognitive Neuroscience). The delay test had six volunteers.
- "Scientists in London" = University College London. The prediction-and-cancel account is well supported but still debated
  (a later eLife paper argues part of the effect comes from contact itself).
- These sources were read through search summaries. The network in this session blocked the full-text pages.

## Re-time to a voice take

```bash
tools/retime.sh path/to/take.mp3
```

This aligns the take, re-times every beat, rebuilds the sound and captions, and renders `out/tickle-2K.mp4`.
Use a copy of the take from outside `voiceover/take/`. For a render longer than about 1500 frames, run
`RENDER=0 tools/retime.sh take.mp3`, then `tools/render_chunk.sh 0 1099`, `tools/render_chunk.sh 1100 2199`, ... and
`tools/join_chunks.sh`.
