# harry-shorts

- `.claude/skills/harry-animator/`: the **harry-animator** skill. Claude Code loads it automatically when this repo is open.
  Call it with `/harry-animator` (or "make a what-if Short with harry-animator").
- `.claude/skills/harry-animator-v2/`: **harry-animator v2** (trial): same pipeline, livelier look - fake-3D depth
  (perspective ground, haze, sun, long shadows), an always-moving camera with whip transitions, a costumed expressive cast
  with colour-emotion gags, story props, one-word captions in a strict Shorts safe area, a continuous music bed and a
  -14 LUFS master. Call it with `/harry-animator-v2`. If the trial run isn't better, v1 stays the default.
- `.claude/skills/harry-animator-v3/`: **harry-animator v3** (trial): the v2 pipeline with a new permanent look - strictly
  flat 2D cel characters (white round faces, thick outline, black oval eyes, thin line limbs, flat clothes) composited
  into a stylized, shaded 3D world (three.js: perspective, textures, directional light, cast and contact shadows), a
  smooth camera, clean cuts. Call it with `/harry-animator-v3`. Look sample: `examples/v3-demo/look.jpg`.
- `shorts/<name>/`: one folder per finished Short (source, script, timing, captions, thumbnails, YouTube text, final video).

Finished: `shorts/water/`, "What if all the water on Earth vanished?" (2K, 45.8 s).
