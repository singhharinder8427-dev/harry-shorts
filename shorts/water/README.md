# What if all the water vanished? (cut-out cartoon Short)

Vertical 2D cartoon Short (1080x1920 comp, 60 fps, delivered 1440x2560 (2K)) made with Remotion. All art is **drawn in code**
(Route B: the Higgsfield account had 0 credits). The voice comes from the creator's own ElevenLabs take (no ElevenLabs connector in this session).

## Script (107 words, incl. the subscribe line)
See `voiceover/script.txt`. Timing sheet for the take: `voiceover/TIMING_SHEET.md`.

## Shots
1. Space: smiling Earth, oceans drain on "vanished", clouds pop, Earth gasps; dive in.
2. Ground: the character with an X-ray water fill to 60%, then shrivels with the flower; the camera glides to the sea, which drains
   to a basin with a depth bracket ("avg ≈ 3.7 km deep", tagged *not to scale*); the camera tilts up and the clouds pop.
3. Space: water-vapor blanket traps heat squiggles; it pops, heat escapes, night falls, Earth shivers, land turns to desert with cacti;
   droplets roll into one water ball (Earth : ball = 9.2 : 1, *drawn to scale*), "under 1,400 km", a row of 9 balls across Earth's
   width; the ball pours back and the oceans refill.
4. Subscribe CTA: a SUBSCRIBE button pops in above Earth, a cursor clicks it on "never", it flips to SUBSCRIBED ✓ with sparkles,
   the bell rings on "next", then the button pops away and the last frame matches frame 0 (loop).

## Re-time to the real voice take and render 2K
```bash
tools/retime.sh path/to/take.mp3
```
(forced alignment with pocketsphinx, one sentence at a time and snapped to pauses → `src/timing.json` → sfx rebuilt → 2K render.)

Other tools: `node tools/stills.mjs <t...>` + `python3 tools/sheet.py` (contact sheets), `python3 tools/qa_video.py <mp4>` (pop / loop /
loudness / audio gaps), `SCALE=2 node tools/thumbs.mjs A B C` (thumbnails).

## Sources
- USGS: all water on Earth as one sphere ≈ 1,385 km (860 mi) across: https://www.usgs.gov/special-topic/water-science-school/science/how-much-water-there-earth
- USGS: up to 60% of the adult human body is water: https://www.usgs.gov/water-science-school/science/water-you-water-and-human-body
- NOAA: average ocean depth 3,682 m (estimate; ~20% of the seafloor mapped in high resolution): https://oceanexplorer.noaa.gov/facts/ocean-depth.html
- NASA GISS / AGU (Schmidt et al. 2010, model attribution): water vapor ≈ 50% of the greenhouse effect, clouds ≈ 25%: https://www.giss.nasa.gov/research/briefs/archive/2010_schmidt_05/ , https://news.agu.org/press-release/taking-measure-of-the-greenhouse-effect/
- Earth's diameter ≈ 12,742 km → 12,742 / 1,385 ≈ 9.2.

## Honesty notes
- "About half" for water vapor is a single model-based estimate, not a measurement. The "desert everywhere" line is an illustration, not a modeled prediction.
- The basin is drawn far out of scale (labelled). Earth and the water ball are to scale (labelled).
- Captions show the script spelling; the alignment assumes the take reads the script as written.
