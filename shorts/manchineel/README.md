# manchineel: "The beach tree you should never sit under"

Made with **harry-animator v3** (flat 2D cel cast in a stylized 3D world). Length limit for this video: 53 s (user's choice).

- Script: `voiceover/script.txt` (147 words). Timing sheet for the voice take: `voiceover/TIMING_SHEET.md`.
- Scenes: `src/Short.tsx` (nine shots on one beach: day, storm, morning, night). Style card per shot: `story.json`.
- Sound: `tools/gen_sfx.py` (effects + music bed, rebuilt from the word times).
- Title, description, tags: `youtube.md`. Thumbnails: `thumbnails/`.

The video is currently built on **estimated** timing. When the voice take arrives:

```bash
tools/retime.sh path/to/take.mp3
```

aligns the take, re-times every beat, rebuilds sound and captions, and renders `out/manchineel-2K.mp4` (about 35 min).

Sources: University of Florida IFAS manchineel fact sheet; Strickland, BMJ 2000 (eating the fruit); Guinness World
Records via secondary reports (rain blistering, most dangerous tree). Read through search summaries only.
The "little apple of death" name and the leaf anecdote are widely reported but not checked against a primary source.
