# What if you were the last person on Earth? (harry-animator v2 test run)

Vertical 2D cartoon Short (designed 1080x1920, delivered 1440x2560 (2K), 60 fps, at most 45 s), drawn entirely in code
with Remotion using the **v2** toolkit: fake-3D perspective scenes with a forward dolly, haze, sun glow and long shadows,
an always-moving camera, whip transitions with speed lines, a costumed cast member (Ray: orange beanie, blue hoodie) with
expressions and a colour-emotion gag (pale blue when lonely), story props (AUTO SHUTDOWN sign, DAY 2 note, BEST QUALITY
2-5 YEARS shelf sign, EARLY-DEATH RISK gauge), one-word captions in the Shorts safe area, a continuous music bed and a
-14 LUFS master.

## Script (104 words incl. the subscribe line) - variant #3 "Story with characters"
See `voiceover/script.txt`; recording guide: `voiceover/TIMING_SHEET.md`.

## Shots (whip transitions between them)
1. Empty highway: Ray waves, yawns, realises everyone is gone (O-O eyes), smug "Finally, no traffic", walks.
2. Power plant at dusk: the AUTO SHUTDOWN lever flips, steam stops, the skyline goes dark; Ray panics.
3. Subway tunnel: the PUMP stops (sad face), water rises, a rat floats by on a board, DAY 2 note, "(one estimate)" label.
4. Supermarket: cart of cans, BEST QUALITY 2-5 YEARS sign, a can pyramid lifts Ray up.
5. Rooftop at night: Ray turns pale blue, the camera pulls back to a tiny Ray in a dark city, a RISK gauge climbs.
6. Highway again: "Okay... I miss traffic", subscribe button + click; the last frame matches frame 0 (loop).

## Re-time to your voice take and render 2K
```bash
tools/retime.sh path/to/take.mp3
```

## Sources
- Scientific American (Weisman), power plants' automatic fail-safes, pumps stop: https://www.scientificamerican.com/article/an-earth-without-people/
- NPR (Weisman): NYC subway flooded after about two days without people (book estimate): https://www.npr.org/2007/11/23/16576768/imagining-a-world-without-humans
- MTA: subway pumps remove ~13-14 million gallons on a dry day: https://new.mta.info/guides/storm-flood-hurricane-service
- USU Extension: low-acid canned food best quality 2-5 years: https://extension.usu.edu/preserve-the-harvest/research/storing-canned-goods.php
- US Surgeon General advisory (2023) via NPR: social disconnection ~ smoking up to 15 cigarettes a day: https://www.npr.org/transcripts/1173418268

## Honesty notes
- The two-day flood is an estimate from one book, labelled "(one estimate)" on screen.
- The loneliness comparison is a research-review comparison, not a direct measurement.
- Simplified cartoon; sources read mostly through search summaries.
