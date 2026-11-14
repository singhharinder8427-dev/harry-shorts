---
name: harry-animator
description: Make a complete faceless YouTube Short (max 45 s, 2K vertical 1440x2560, 60 fps) about a surprising fact or "what if" question, end to end - topic (the user's own, a viral-potential topic researched online, or a pasted script to fact-check and make original), a researched and source-checked voiceover script with a subscribe line, then a flat 2D cut-out cartoon animation drawn entirely in code with Remotion (2.5D multiplane camera, characters and objects with faces, code effects, captions, code-made sound effects, animated subscribe ending, seamless loop), re-timed to the user's own voice take, plus thumbnails, captions file, YouTube title, description and tags. Use whenever the user calls harry-animator or asks for a what-if / surprising-fact Short, script plus animation, in this cartoon style.
---

# harry-animator: researched script -> code-drawn cartoon Short

What this makes: a vertical Short (designed at 1080x1920, delivered **1440x2560 (2K), 60 fps, at most 45 s**) in which a
simple flat cartoon (thick black outlines, flat colours, big round heads, objects with faces) acts out a voiceover. **All
art is drawn in code** as SVG inside Remotion; motion, camera, effects, captions, sound effects and timing are code too.
The voice is the user's own take (recorded or made in their own voice tool) and the video is re-timed to it word by word.

Worked example shipped with this skill: `examples/water/`, "What if all the water on Earth vanished?" (107 words incl.
the subscribe line, 45.8 s, 3 shots, Earth with a face, a noodle-limb guy with an X-ray water fill who shrivels, a draining
ocean basin, clouds that pop, a water-vapor blanket, heat escaping, a to-scale water ball, an animated subscribe button,
seamless loop). Copy its patterns; never reuse its topic.

Read the whole file once before starting. Follow the order; each step says what "done" looks like. Never name or
recommend a specific image-generation or voice service in anything you write for the user (say "your voice tool").

Folder map (`<SKILL>` = this skill's base directory):
- `scripts/` - `new_project.sh` (makes a project), `gen_timing.py`, `align_take.py`, `sfxlib.py`, `gen_sheet.py`,
  `make_captions.py`, `stills.mjs`, `sheet.py`, `thumbs.mjs`, `qa_video.py`, `retime.sh`
- `templates/remotion/` - package.json (pinned versions), remotion.config.ts, tsconfig, `src/` (`math.ts`, `color.ts`,
  `Layer.tsx`, `Captions.tsx`, `Bits.tsx` = Puff/Pill/Bracket/Sparkle, `Character.tsx` = the guy + Flower, `Root.tsx`)
- `examples/water/` - `Short.tsx` (complete composition: shots, camera, every beat, CTA, thumbnails), `Earth.tsx`
  (an object character with face, drain, night, desert), `story.json`, `script.txt`, `timing.json` (real take),
  `gen_sfx.py` (cue list), `youtube.md`, `thumb_C.jpg`
- `references/youtube-metadata.md` - title / description / tags rules and template

---------------------------------------------------------------------------------------------------------------------
## 0. Ask first: how do we start? (always, before any research)

Ask with a multiple-choice question (AskUserQuestion when available), these three options:
1. **My topic** - "I'll give you a topic." Then ask for the topic (and, if it is for a client/another channel, anything
   they need: channel niche, audience, words to avoid). Research it and write the script (section 1).
2. **Find a viral topic** - "You find a topic that can go viral." Research what is working right now (section 1A), pick
   the strongest, write our own original version.
3. **My script** - "I'll paste a full script." Then ask for it. Fact-check it, fix it, make it original and spoken
   (section 1B), show the final version.

Whatever is chosen, the rest of the pipeline is identical. The user may be making the video for someone else; it changes
nothing except the topic/script source.

---------------------------------------------------------------------------------------------------------------------
## 1. The script (rules for every route)

Browsing is required. If web search / fetch is not available, say so plainly and stop or ask - never pretend you
researched, and never write facts from memory as if checked.

### 1.0 Picking a topic (routes 1 and 2)
- Research **several** ideas before choosing (at least 4-6 candidates on route 2). Good shapes: unusual questions,
  surprising explanations, everyday mysteries, strange facts, "what would happen if...". Subjects: science, animals,
  history, the human body, space, engineering, nature, everyday objects. Example of the right curiosity: "What if all water
  suddenly disappeared from Earth?" - a simple premise that makes people imagine the consequences.
- Choose the one that: can be explained clearly in 30-45 s; has a surprising answer or consequence; is easy to show with
  simple 2D animation (objects can get faces, things can grow/shrink/drain/pop, a size comparison, a before/after);
  makes sense with zero background knowledge.
- Vary the subject category from earlier videos. Check the ideas visible in this conversation and in `topics_log.md`
  (in the working folder, if it exists) and avoid repeats or slight variations. If you cannot see previous ideas, don't
  claim you checked them. After a video is done, append its topic + category + date to `topics_log.md`.

### 1A. Route 2: finding a viral topic
- Search for what is currently getting traction in this format: "what if" / surprising-fact / science Shorts topics,
  recent science news that is easy to picture, perennial questions people search ("why is the sky blue" style), and
  seasonal hooks (an eclipse, a heatwave, a launch). Look at which *questions* do well, not at other creators' scripts.
- Score candidates 1-5 on: hook strength (can it be said in one line that makes you need the answer?), surprise of the
  answer, visual simplicity, broad appeal, fact solidity (strong sources exist), novelty vs. what is already saturated.
  Pick the top score; mention runner-ups in one line so the user can switch.
- Make our own angle: a different premise, consequence or comparison; original wording; never copy a creator's script,
  title, structure or visuals. Viral potential is a judgment, not a guarantee - say so once.

### 1B. Route 3: the user's script
- Extract every factual claim (numbers, causes, comparisons, quotes). Verify each against reliable sources (below).
  Mark each: confirmed / needs correction / unsupported. Fix or cut what doesn't hold up; keep uncertainty where it matters.
- Rewrite into the style rules below in original wording (so it isn't a copy of anything it was based on), keep the user's
  idea and structure where they work, fit it to 45 s including the subscribe line. Show what changed and why (a short list).

### 1.1 Fact-checking (all routes)
- Verify the central fact with reliable sources: original research papers, universities, museums, government agencies
  (NASA, NOAA, USGS, NIH...), established scientific organisations. Cross-check the explanation with a second source.
- Do not invent facts, numbers, quotes or consequences. Keep uncertainty where it matters ("about", "estimated", "one
  study found"). If a popular version of the fact conflicts with the official source, script around the part that holds
  up and tell the user what could not be verified. Note which figures are estimates or single studies.
- Cartoon exaggeration is fine in what the characters *do*; the voice states only real facts.

### 1.2 Writing (all routes)
- Length: **the finished Short is at most 45 s** including the subscribe line: about 95-115 words total (the main
  explanation ~85-105 words + the CTA line ~8-10 words). 30-40 s of explanation is ideal.
- Start immediately with a specific question or a surprising statement. No greeting, no intro, no "In this video".
- Build curiosity by explaining what would happen, why the obvious answer is wrong, or what makes it unusual; deliver a
  clear, satisfying answer near the end. Build toward it without filler or dragging.
- Simple, natural, conversational English; short connected sentences that sound good aloud. Every sentence adds
  information.
- Never: "Did you know?", "This will blow your mind", "You won't believe this", forced suspense, exaggerated claims,
  hype words (incredible, shocking, insane, amazing), AI-sounding phrases, narrator filler ("here's the thing", "but here's
  the part"), "!" lines (they make voices over-act), calls to action other than the final subscribe line.
- Original wording; never copy another creator's script.
- **End with one subscribe line** that gives a reason, warm and direct, no hype - e.g. "Subscribe so you never miss the
  next what-if." / "Subscribe for more strange facts like this." Vary it per video; keep it one short sentence.

### 1.3 Script deliverable (show this, then continue)
- a one-sentence description of the idea;
- the complete voiceover, ready to record, no scene directions;
- the narration word count and estimated length;
- links to the sources that support the explanation (and a short note of what is an estimate / single study / unverified).
Then also write the YouTube metadata now or at hand-off (section 13). Done = the user has the script; proceed unless they
want changes.

---------------------------------------------------------------------------------------------------------------------
## 2. Project setup

```bash
bash <SKILL>/scripts/new_project.sh <workdir>/<short-name>-short <short-name>            # empty project
bash <SKILL>/scripts/new_project.sh <workdir>/<short-name>-short <short-name> --example  # with the water example to study/run
```
It copies the Remotion template to the project root, the scripts to `tools/`, runs `npm install` (pinned:
remotion 4.0.250, react 18.3.1, typescript 5.6.3 - TypeScript 6 breaks this Remotion's bundler), and checks
numpy / pillow / opencv / ffmpeg. Put the project inside the user's primary working directory so they can open files.
Project layout: `story.json`, `src/` (components + `timing.json`), `tools/`, `voiceover/` (script.txt, timing sheet,
take/, captions), `public/<short>/` (vo.wav, sfx.wav only), `qa/`, `out/`, `thumbnails/`.
Cloud sandbox notes: Remotion uses the pre-installed headless Chromium when present (config auto-detects); no GPU, so
use `--concurrency=<cores>` and run renders in the background; Hugging Face is usually blocked, so word times come from
forced alignment with pocketsphinx (its wheel ships the English model), installed in a venv by `retime.sh`.

---------------------------------------------------------------------------------------------------------------------
## 3. Script -> beat sheet -> story.json

1. Split into sentences (one voice sentence = one or two caption chunks of 2-6 words, split where a speaker breathes).
2. One visual beat per line, on the exact word ("vanished" = the oceans drain, "shrivel" = he shrivels, "nine" = the row
   of nine balls). Name each beat as a key word.
3. Frame 0 states the premise like a thumbnail (the main object with a face, centred, big, readable). No intro, no rewind.
4. Shots: as few hard cuts as possible (2-3 shots for 45 s; a continuous camera move inside each). Cut only for a new
   place/scale (space -> ground -> space). Cuts sit on a sentence start.
5. One gag per beat a kid would laugh at: an object comes alive and opens its eyes, gasps "o", squeezes "> <", shivers
   with chattering teeth, a sweat drop, the character deflates into a wrinkly raisin, a fish flops, clouds squeeze their eyes
   and pop, a smug smirk, the thing comes back at the end.
6. The ending: the payoff lands on the last word of the explanation, then the subscribe CTA (section 8.9), then the last
   frame equals frame 0 (loop): whatever changed returns (oceans refill, clouds come back, colours reset, camera back to
   its first key).
7. Write `story.json`:
```json
{"short": "water", "title": "What if all the water on Earth vanished?",
 "spoken": {"1,400": "fourteen hundred"},
 "chunks": ["If every drop of water", "on Earth vanished,", "you wouldn't survive it.", "..."],
 "syllables": {"every": 2, "kilometers": 4, "1,400": 4},
 "keys": {"vanished": [0, "vanished"], "shrivel": [1, "shrivel"], "subscribe": [9, "subscribe"]},
 "beats": {"vanished": "Earth's oceans drain, clouds pop, Earth gasps", "...": "..."}}
```
   `keys`: name -> [sentence index, word] (first occurrence in that sentence; punctuation stripped, hyphens removed:
   "what-if" -> "whatif"). `spoken`: how numbers / unusual words are pronounced (for the aligner). `syllables`: overrides
   for the estimate.
8. Estimate the timing: `python3 tools/gen_timing.py story.json --out src/timing.json` (4.7 syllables/s = natural
   conversational pace, +0.2 s after a comma, +0.5 s after a sentence, first word at 0.4 s, 1.6 s tail). If the estimate
   is over ~44 s, shorten the script now.
Done = beat table (time / words / on screen / sound) + story.json + estimated timing.json.

---------------------------------------------------------------------------------------------------------------------
## 4. Voice: timing sheet for the user's take

- `python3 tools/gen_sheet.py` writes `voiceover/TIMING_SHEET.md`: the script to paste as **one single take**, target
  length, settings, sentence targets (for one-clip-per-sentence users), key words with what happens, caption table.
- Voice guidance (generic, no service names): a normal, natural conversational voice (male or female), not deep, not a
  narrator, not hype; plain text only, no tags, no stage directions in the text box (TTS reads them aloud); if the tool has
  them, medium stability (~0.5) and style/exaggeration 0; speed 1.0, adjust `speed = take length / target`. Keep the words
  exactly as written; ask how numbers were read.
- Never fake a voice and never present a placeholder (or a robot test voice) as the voiceover. While waiting for the take,
  build and preview the video on the estimated timing (sections 5-10); the real take re-times everything (section 11).
Done = timing sheet sent to the user.

---------------------------------------------------------------------------------------------------------------------
## 5. Drawing in code (the cut-out look)

Everything is React SVG. Study `templates/remotion/src/Character.tsx` and `examples/water/Earth.tsx`.
- **Outline weight**: every layer provides its scale `k` (`useK()`); every stroke width is `px / k`, so outlines keep the
  same on-screen weight at every depth and zoom: 9 px characters/objects, 7-8 px props/labels. One outline family everywhere.
- **Merged silhouettes**: draw all parts once in ink (each part grown by the outline) and then all parts in fill colour on
  top - one clean outline around the whole body. Noodle limbs = the path stroked twice (ink width + 2*outline, then fill
  width), round caps. Hands = outlined circles drawn last.
- **Character** (the guy): white round head (r 100) with a pale-grey crescent shade, small bean torso, noodle arms/legs,
  ellipse feet, feet at (0,0). Face slides over the head (`faceDx/faceDy` = look direction); eyes are black ovals (blink =
  squash ry), `wide` eyes with a glint, `squeeze` = "> <" chevrons; brows are short curved strokes with a tilt (+ = inner
  end down = angry/squint, - = inner end up = worried - define once, an inverted tilt turns worried into angry); mouths
  smile / flat / o / open with a clipped pink tongue / wavy. Extras: X-ray fill (a liquid level masked by the body
  silhouette, wavy surface), shrivel (squash about the feet, beige tint, wrinkle strokes), sweat drop.
- **Objects with faces** (planet, cloud, volcano, sun, droplet...): white eye ellipses with black pupils + white glint
  (pupils move to look at the action), eyelids as a shape clipped to the eye in the object's own colour, thick round brows,
  pop open with overshoot, blink, squeeze "> <" (never empty lidded rings), smug = half lids + relaxed brows, a big grin
  with tongue, an "o" gasp, chattering teeth when cold.
- **Flat colour only**: no gradients on characters; one flat shade crescent; colour changes are flat colour mixes (dry
  seafloor brown, desert sand, night tint overlay). Sky/space backgrounds may use a soft screen-space gradient.
- Helpers in `Bits.tsx`: `Puff` (circle cluster with one merged outline: clouds, smoke, steam), `Pill` (white label
  with outline, constant screen size), `Bracket` (measurement bar with end ticks, revealed from the middle), `Sparkle`.
Done = every drawing checked on a contact sheet at every beat before animating further.

---------------------------------------------------------------------------------------------------------------------
## 6. The world: 2.5D multiplane camera

`Layer.tsx`: every layer is a flat full-frame SVG at depth Z; the camera has (x, y, z); a layer's scale is
k = 1000 / (Z - z). Units: camera (540, 960, 0) shows the Z 1000 layer at 1 world px = 1 screen px. Dollying makes near
layers grow faster than far ones (real depth). Layers closer than `minDepth` (300) are hidden - make sure their content
is already off-screen.
- Depths that worked: stars 5000, clouds/sky 1600, main characters + ground 1000; space shots put the planet at 1000.
  Ground = flat bands with one black profile line; the ground band in front covers the base of anything behind it.
- Camera keys: `camAt(t, [[time, {x, y, s}], ...])` where `s` is the scale of the Z 1000 layer, interpolated in log space
  (even zooms); easeInOutCubic glides of at least 1 s; holds perfectly still; keys sit on word keys (`K.oceans - 0.4`).
  The last key equals the first (loop).
- Depth of field (optional): blur far layers 2.5-3.6 px only while close on a character.
- Keep important things centred and inside the frame when the camera holds; keep labels out of the caption band.
  A half-visible character at the screen edge in a close-up looks like a glitch - keep it fully in or fully out.
- Screen shake = sums of sines times an envelope (a few px), never random per-frame jumps.
- A dive-in (fast push toward the subject) hides a cut nicely.

---------------------------------------------------------------------------------------------------------------------
## 7. Animating

- Poses are numbers keyed on word times: `kfs(t, [[time, value], ...])` (smoothstep), `pick` for step changes (mouth
  shapes, eye types), `pop` (overshoot pop-in), `popOut` (swell then shrink away), `spring` (damped wobble), `bump`.
- Never cross-fade two drawings (half-transparent ghosts read as a glitch). Things appear by popping/growing and leave by
  shrinking; shapes change by morphing numbers.
- Anticipation before an action (squash 0.94 / stretch 1.04), settle after it (damped spring); a small squash on impact.
- Life on holds: breathing (scaleY 1 +- 0.8 % about the feet, an integer number of cycles over the duration), blinks,
  a tremble when scared or cold (small sines), eyes that follow the action.
- Contact shadow under standing characters (soft ellipse, rgba(72,54,42,0.26), 3 px blur).
- Props with physics where the story needs them: a thrown/flying object moves on an arc (gravity parabola, apex placed
  late to stay in frame), spins about one turn, ends exactly where it is drawn next. Objects in a draining liquid follow
  the level and settle on the floor profile with a tilt (`floorAt(x)`), a fish flops.
- One focal action at a time; effects stop when their beat is over.

---------------------------------------------------------------------------------------------------------------------
## 8. Effects, labels, captions, CTA (all code)

8.1 Liquids: flat shapes without outline (water #3FA7F5, deep #2A86D9, light rim #BFE6FF); draining = a level that
    eases down inside a clip of the basin profile; on a globe, a wobbly circle that shrinks to the centre (and grows back).
8.2 Smoke / steam / clouds: `Puff` circles with one merged outline; grow, drift, then shrink away (don't fade outlined
    puffs). Pulses with gaps and different speeds so jets don't look identical. Clouds can have faces.
8.3 Heat / cold: orange wavy squiggle arrows (black underlay) that bounce back under a blanket and fly off when it's gone;
    a night tint + shiver + chattering teeth + pale-blue sparkles for cold; glow as low-opacity radial gradients only.
8.4 Particles: droplets / blobs born in bursts, arcs with gravity, merging into a target that grows.
8.5 Labels: `Pill` labels (numbers exactly as in the voice: "avg ≈ 3.7 km deep", "under 1,400 km", "up to 60% water"),
    `Bracket` measurement bars, a row of copies for a size comparison ("Earth ≈ 9× wider"). Labels pop in on their word,
    pop out when the beat ends.
8.6 Honesty tags: when a drawing is far from scale, a small top tag "not to scale"; when a comparison is truly to scale,
    "drawn to scale". Keep the same tags on thumbnails.
8.7 Captions (`Captions.tsx`): Inter 900, white with a 15 px black stroke (`paint-order: stroke fill`), the spoken word
    in yellow #FFE14D, at most two lines, band y 1385-1615 (above the Shorts UI), chunks follow where the voice pauses,
    a tiny scale-in per chunk. Avoid a single orphan word on line two (re-chunk in story.json).
8.8 Exaggeration is for what characters do, never for the facts in labels.
8.9 **Subscribe CTA** (see `Cta` in `examples/water/Short.tsx`): on "Subscribe" a generic red SUBSCRIBE button (no
    platform logo) + bell pops in above the main object (screen y ~360-500, clear of captions), the object looks up at it, a
    cursor flies in; on the next stressed word the cursor clicks: the button squashes, flips to grey "SUBSCRIBED ✓",
    sparkles burst, a click + chime; the bell turns yellow and rings; ~0.75 s before the end the button pops away and the
    object looks back at the viewer so the last frame equals frame 0. Camera settles on its first key by the CTA.

---------------------------------------------------------------------------------------------------------------------
## 9. Sound (code-made)

- `tools/gen_sfx.py` = the short's cue list using `sfxlib.py` (`init(DUR)`, `add(sound, at, db)`, `write(path, DUR)`):
  pop, plip (drops), whoosh (camera moves, peak on the move), slurp/gurgle (draining), deflate + thud (shrivel), ding
  (labels, measurements), shimmer, sizzle, chatter, splash (refill), breeze bed, click (CTA). Copy
  `examples/water/gen_sfx.py` and rewrite the cues. Every cue time is a word key from `src/timing.json`, so a re-time
  regenerates the sound.
- Levels in the cue list: impacts -6 to -10 dB, pops/dings -10 to -18 dB, whooshes -12 to -20 dB, beds -20 to -24 dB;
  the effects mix is peak-normalised to 0.7 and plays at volume 0.42 under the voice (volume 1, loudness-normalised to
  -16 LUFS). Big sounds go into pauses, not on top of words.
- You cannot hear the result: verify by measurement (section 10) and say so.

---------------------------------------------------------------------------------------------------------------------
## 10. Checks (before the take arrives, and again after)

- **Type check**: `npx tsc -p .` must be clean.
- **Contact sheets**: `node tools/stills.mjs <t1> <t2> ...` (env `COMP`, `SCALE=0.5`, `PROPS`) -> `qa/still_<t>.png`;
  `python3 tools/sheet.py qa/sheet.png qa/still_*.png`. Look at frame 0, every beat (key + 0.3-0.8 s), every cut, every
  label, the CTA, the last frame. Fix framing (labels cut by the frame edge, things in the caption band, crowding) and
  re-check.
- **Preview**: render 0.5x (`npx remotion render src/index.ts Short out/preview.mp4 --scale=0.5 --crf=20`), then
  `python3 tools/qa_video.py out/preview.mp4`:
  - pop scan (caption + tag bands masked): every flag must be an intended cut, pop-in or fast action - list them against
    the beat table; an unexplained isolated spike is a bug;
  - loop: first vs last frame mean abs diff < 0.5 on the preview (< 0.2 at full size). Things that break loops: a drifting
    cloud or breathing that doesn't complete whole cycles over the duration, a state that isn't reset;
  - loudness and audio silences.
- Send the preview + timing sheet + thumbnails to the user while waiting for the take.

---------------------------------------------------------------------------------------------------------------------
## 11. Re-time to the real take, render 2K

```bash
tools/retime.sh path/to/take.mp3          # RENDER=0 to stop before rendering; CONC=<n> render concurrency
```
It: (1) aligns the take with pocketsphinx **one sentence at a time** - the take is split at its sentence pauses (pause
nearest the syllable-proportional estimate, long pauses preferred), each sentence force-aligned with beam-widening
retries, words missing from the dictionary handled via `spoken` / apostrophe fallbacks, then word edges snapped to real
silences (>= 0.12 s, within 0.15 s); a sentence that still fails is spread by syllables inside its own exact boundaries
and reported; (2) writes `src/timing.json` with the voice placed so the first word lands at 0.40 s, duration = last word
+ 1.6 s; (3) loudness-normalises the voice to `public/<short>/vo.wav`; (4) rebuilds sfx, timing sheet, captions.srt and
word_times.csv; (5) renders `out/<short>-2K.mp4` from the `Short2K` composition (1440x2560: the 1080x1920 design
drawn at 4/3 - a fractional `--scale` gives an odd width and fails; vector art stays sharp).
Before rendering: read the aligned words (sentence pauses should match `ffmpeg silencedetect`), check the duration is
<= 45 s (if not: ask for a faster take or cut a sentence), re-render contact sheets on the real timing.
Render in the background (about 7 min for 45 s on 4 cores) and wait for it.
**Verify the file**: 1440x2560, 60 fps, frame count = duration x 60, audio present and as long as the picture, `qa_video.py`
on the final: flags all intended, loop diff < 0.2, loudness about -16 LUFS, true peak below -1 dB, audio silences at the
sentence gaps (voice offset applied). Say sync was verified by measurement and stills, not by ear.

---------------------------------------------------------------------------------------------------------------------
## 12. Thumbnails (three variants)

- `Thumb` composition (`variant` A/B/C) renders a chosen moment from the same components with no tags in the way + big
  text; `SCALE=2 node tools/thumbs.mjs A B C`, then save 1080x1920 JPGs (quality 93) with PIL.
- Text: at most five words, Inter 900, white line + yellow line, 26-30 px #111 stroke, drop shadow, `white-space: nowrap`,
  inside the safe zone (x 90-990, y ~285-1635), never over the main face. Every claim must be true for the video; keep
  "drawn to scale" / "not to scale" tags.
- Concepts: (A) the premise moment with the object's shocked face; (B) the funniest character gag; (C) the key number or
  size comparison as the hero ("ALL EARTH'S WATER / THIS SMALL?"). Check all three at phone-feed size (216x384) on one
  sheet. Recommend one and say it is design judgment, not click data.

---------------------------------------------------------------------------------------------------------------------
## 13. YouTube title, description, tags (every video)

Follow `references/youtube-metadata.md` (example: `examples/water/youtube.md`): a 40-60 character title + 2 alternates,
a description (hook line, 2-3 plain sentences with the key facts, honesty line about scale if needed, sources with URLs,
the subscribe line, 3 hashtags incl. #Shorts), 10-15 tags under 500 characters. Everything must match the video's facts;
no bait, no other creators' names. Save as `youtube.md`.

---------------------------------------------------------------------------------------------------------------------
## 14. Hand-off and honesty

Deliver (send the files; put them in the user's working folder): `out/<short>-2K.mp4`, `voiceover/captions.srt`,
`voiceover/word_times.csv`, `thumbnails/thumb_A/B/C.jpg` (+ recommendation), `youtube.md`, the timing sheet, a README
(script, sources, how to re-run: `tools/retime.sh new_take.mp3`). Report plainly, in short:
- the check results (size, fps, frames, length, loudness, loop, pop flags = intended);
- what was verified and what was not (estimates, single studies, sources read only through search summaries);
- that exaggerated visuals are labelled;
- that alignment assumes the take reads the script as written (a misread word still shows the script word);
- that you can't hear the result, and the user should watch once with sound before posting;
- if the length is over 45 s, how to fix it (faster take, cut a sentence).
Append the topic to `topics_log.md`.

---------------------------------------------------------------------------------------------------------------------
## 15. Rules that keep it looking hand-made

- Frame 0 = the premise, centred, big, readable; the first spoken line names what you see.
- Everything centred and balanced when the camera holds; nothing important cut by the frame edge; nothing in the
  caption band except captions.
- No motion blur, no cross-fades between drawings, no random jitter. Every move eased; camera glides >= 1 s.
- One focal action at a time; effects stop when their beat is over.
- Same outline weight family everywhere; flat colours; no gradients on characters.
- Every visual sits on its word; the payoff lands on the last explanation word; the CTA follows; the last frame loops to
  the first.
- Real facts only in the voice and labels; cartoon exaggeration only in what characters do, and labelled.

Pitfalls already met: TypeScript 6 breaks the Remotion 4.0.250 bundler (keep 5.6); `--scale=1.333` gives an odd width
(use `Short2K`); pocketsphinx fails to align 40 s in one pass (align per sentence); words like "adult's" aren't in its
dictionary (fallbacks/`spoken`); a 0.10 s silence threshold mistakes plosives for gaps (use 0.12 s); drifting clouds and
non-integer breathing break the loop; labels near the right edge get cut at wide zooms (check sheets); a thumbnail line
that wraps to three lines crowds the face (nowrap, smaller size for long lines).
