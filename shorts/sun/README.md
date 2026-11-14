# What if the Sun vanished right now? (code-drawn cartoon Short)

Vertical cartoon Short made with Remotion (designed 1080x1920, delivered 1440x2560, 60 fps). All art, motion, captions and
sound effects are code. **Status: built on estimated timing (35.6 s); waiting for the voice take.**

## Script (101 words incl. the subscribe line)
See `voiceover/script.txt`. Timing sheet for the take: `voiceover/TIMING_SHEET.md`.

## What happens (one continuous shot)
1. The Sun (with a face) gasps and pops on "vanished"; a dashed outline stays. A dark hole spreads through its light at
   light speed, edged by a yellow "last sunlight" ring. Earth keeps smiling.
2. A timer counts to 8:20. Thought bubble: the Sun still shining in a blue sky, the guy waves at it.
3. Wide view: Earth keeps moving on its orbit round the "empty spot"; a purple "last gravity" ring rides with the light ring.
4. Both rings reach Earth as the timer hits 8:20: the sky goes dark and Earth leaves on a straight line ("≈ 30 km/s").
5. "1 week later": thermometer drops below 0 °C, Earth shivers. The oceans ice over; a cut-away bubble shows ice on top,
   liquid water and a fish below, heat rising from the seafloor ("thousands of years").
6. The Sun pops back, light floods out, Earth thaws and glides home; SUBSCRIBE button, click, bell; last frame = frame 0.

## Re-time to the real voice take and render 2K
```bash
tools/retime.sh path/to/take.mp3
```
Other tools: `node tools/stills.mjs <t...>` + `python3 tools/sheet.py` (contact sheets), `python3 tools/qa_video.py <mp4>`,
`SCALE=1 node tools/thumbs.mjs A B C` (thumbnails).

## Sources
- NASA Space Place: sunlight takes about 8 minutes 20 seconds to reach Earth: https://spaceplace.nasa.gov/all-about-the-sun/en/
- NASA Earth Fact Sheet: mean orbital velocity 29.78 km/s ("about thirty"): https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- LIGO/Virgo + Fermi/INTEGRAL (GW170817): gravity's speed equals light's to within a few parts in 10^15: https://arxiv.org/abs/1710.05834
- Popular Science (citing David Stevenson, Caltech): below 0 °F within a week, about -100 °F in a year; oceans freeze on top and
  stay liquid below for hundreds of thousands of years: https://www.popsci.com/science/article/2013-07/if-sun-went-out-how-long-could-life-earth-survive/
- Live Science: subfreezing almost everywhere within days: https://www.livescience.com/planet-earth/what-would-happen-to-earth-if-the-sun-suddenly-vanished

## Honesty notes
- The cooling numbers are magazine-level estimates, not a published model; the script says "within a week" and "thousands of
  years", both on the cautious side of what the sources give. The two magazine pages were read through search summaries only
  (their sites were not reachable from the build machine).
- The Sun cannot vanish; "gravity travels at the speed of light" means changes in gravity do.
- Sizes and distances are far from scale (tagged on screen). The timer compresses 8 min 20 s into about 15 s of video.
- Captions show the script spelling; alignment assumes the take reads the script as written.
