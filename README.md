# harry-shorts

**Default: harry-animator v3** - `.claude/skills/harry-animator-v3/`. Any "make a Short" / what-if / surprising-fact
request in this repo uses it (or call `/harry-animator-v3`). The permanent look: flat 2D cel characters (round heads,
thin line limbs, flat clothes, face colour that follows the situation) acting in a stylized, shaded, code-built 3D world;
a new picture for every caption phrase with one-layer-deep cutaways; it asks the length every time.
Look sample: `.claude/skills/harry-animator-v3/examples/v3-demo/look.jpg`. Packaged for upload: `dist/harry-animator-v3.skill`.

**Blob the Brilliant cast library** (v3, 16 Nov 2026) in `templates/remotion/src/`: `Cast.tsx` (arms and legs with elbows
and knees, lab coat / suit / trench coat, hats, sunglasses, headband, held props), `Poses.ts` (24 named poses,
18 expressions, blending, walk / run cycles) and `Roles.ts` (Blob, fixed in teal `#1FA6A0`, his story costumes, and 9
role templates whose look changes per video). The same three files are in Appendix A of the skill's `SKILL.md`.

Older versions, kept for reference (used only when called by name):
- `.claude/skills/harry-animator/` (v1): flat cut-out cartoon on a 2.5D multiplane camera. `/harry-animator`
- `.claude/skills/harry-animator-v2/` (v2): fake-3D flat world, whip transitions, colour-emotion cast. `/harry-animator-v2`

`shorts/<name>/`: one folder per finished Short (source, script, timing, captions, thumbnails, YouTube text, final video).
Latest: `shorts/manchineel/` - "The beach tree you should never sit under" (v3, 2K, 52.8 s).
