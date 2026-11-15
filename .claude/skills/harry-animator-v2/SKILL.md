---
name: harry-animator-v2
description: (v2 - livelier: fake-3D depth, always-moving camera with whip transitions, a costumed expressive cast with colour-emotion gags, story props, one-word captions in a strict safe area, continuous music bed) Make a complete faceless YouTube Short (max 45 s, 2K vertical 1440x2560, 60 fps) about a surprising fact or "what if" question, end to end - topic (the user's own, a viral-potential topic researched online, or a pasted script to fact-check and make original), a researched and source-checked voiceover script with a subscribe line, then a flat 2D cut-out cartoon animation drawn entirely in code with Remotion (2.5D multiplane camera, characters and objects with faces, code effects, captions, code-made sound effects, animated subscribe ending, seamless loop), re-timed to the user's own voice take, plus thumbnails, captions file, YouTube title, description and tags. Use whenever the user calls harry-animator-v2 (or harry-animator when they ask for the v2 / livelier style) or asks for a what-if / surprising-fact Short, script plus animation, in this cartoon style.
---

# harry-animator v2: researched script -> code-drawn cartoon Short that feels alive

**What v2 changes vs v1** (everything else in the pipeline is identical). Learned from studying lively 2D-character-in-a-deep-world
Shorts; we copy techniques, never another channel's characters, settings or look:
1. **Fake 3D, not real 3D**: worlds get depth from perspective ground planes with a vanishing point, a forward dolly,
   many parallax layers, haze, sun glow, long cast shadows, shaded/textured world objects and blurred foreground
   objects close to the lens. Characters stay flat cut-outs (section 6B, `Depth.tsx`).
2. **The camera is never still** (hand-held drift on every hold, push-ins on key words), **6-10 shots** linked by
   **whip / fly-through transitions every 3-5 s** with directional blur and speed lines (sections 6, 6C).
3. **A bigger, more expressive cast**: a small recurring cast with costume identities, framed big (waist-up and
   close-ups), acting to camera, with short in-story lines; **colour-emotion gags** (face turns red/purple + steam when
   angry, pale blue when scared, green when sick) (section 5B, `Cast.tsx`).
4. **Story props**: the world tells the story with writing on things (signs, banners, newspapers, notes) instead of
   floating labels where possible (section 8.10, `Story.tsx`).
5. **One-word captions inside a strict safe area** (x 140-900, y 1150-1330 of 1080x1920) so nothing hides under the
   Shorts title or buttons (section 8.7, `Captions.tsx`, `SafeGuides`).
6. **Five script variants** (section 1.4): from a topic or a pasted script, write 5 complete scripts at different
   angles (curious, emotional, story with characters, myth-buster, stakes/scale), recommend one, and the user picks.
7. **Continuous audio bed**: a code-made music bed runs the whole video (never silent), ducked under the voice; the final
   mix is mastered to -14 LUFS (section 9, `sfxlib.bed`, `master_audio.py`).
Still: at most 45 s, 2K 60 fps, flat colours on characters, real facts only, seamless loop.

What this makes: a vertical Short (designed at 1080x1920, delivered **1440x2560 (2K), 60 fps, at most 45 s**) in which a
simple flat cartoon (thick black outlines, flat colours, big round heads, objects with faces) acts out a voiceover. **All
art is drawn in code** as SVG inside Remotion; motion, camera, effects, captions, sound effects and timing are code too.
The voice is the user's own take (recorded or made in their own voice tool) and the video is re-timed to it word by word.

Worked examples: `examples/v2-demo/Short.tsx` (8 s, every v2 helper in use: perspective dolly, haze, sun, long
shadows, drift, costumed cast + colour emotion + steam, sign / banner / newspaper props, whip transition, one-word
captions, safe-area guides) and `examples/water/` (v1 composition: story, beats, CTA, thumbnails - its camera and
captions follow v1 rules; use v2 rules instead). The water example:, "What if all the water on Earth vanished?" (107 words incl.
the subscribe line, 45.8 s, 3 shots, Earth with a face, a noodle-limb guy with an X-ray water fill who shrivels, a draining
ocean basin, clouds that pop, a water-vapor blanket, heat escaping, a to-scale water ball, an animated subscribe button,
seamless loop). Copy its patterns; never reuse its topic.

Read the whole file once before starting. Follow the order; each step says what "done" looks like. Never name or
recommend a specific image-generation or voice service in anything you write for the user (say "your voice tool").

Folder map (`<SKILL>` = this skill's base directory):
- `scripts/` - `new_project.sh` (makes a project), `gen_timing.py`, `align_take.py`, `sfxlib.py`, `gen_sheet.py`,
  `make_captions.py`, `stills.mjs`, `sheet.py`, `thumbs.mjs`, `qa_video.py`, `retime.sh`, `master_audio.py`
  (`sfxlib.py` v2 adds `bed()` / `write_bed()`)
- `templates/remotion/` - package.json (pinned versions), remotion.config.ts, tsconfig, `src/` (`math.ts`, `color.ts`,
  `Layer.tsx`, `Captions.tsx` = one-word safe-area captions + `SafeGuides`, `Bits.tsx` = Puff/Pill/Bracket/Sparkle,
  `Character.tsx` = v1 guy + Flower, **`Cast.tsx`** = v2 `Person` (costumes, stick limbs, expressions, colour emotion,
  steam), **`Depth.tsx`** = fake-3D toolkit (`proj`, `PerspGround`, `Billboard`, `HazeDefs`/`hazeFilter`, `drift`,
  `Whip`, `SpeedLines`, `SunGlow`, `LongShadow`, `shades`, `Speckle`, `Strata`, `Foreground`), **`Story.tsx`** =
  `Sign`, `Banner`, `Newspaper`, `Note`, `Root.tsx`)
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

Whatever is chosen, research and fact-check first, then write **five script variants** (section 1.4) and let the user
pick before any animation. The rest of the pipeline is identical. The user may be making the video for someone else; it changes
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

### 1.4 Five script variants (v2, every route)
After the research and fact-check (one shared fact sheet), write **5 complete, recordable scripts** for the same topic,
each from a clearly different angle. Route 3 (the user's script): keep the user's idea and verified facts, and make 5
engaging rewrites of it at these angles (plus the "what changed" list from 1B, once). Route 2: after picking the topic,
same 5 angles. The five angles (one script each):
1. **Curious / what-if**: opens on a question or a "what would happen if", builds by consequences, clean answer.
2. **Emotional / human**: told through a person's feeling or stakes (a worker, a kid, a family, someone in history);
   warm, makes you care, still factual - no melodrama, no invented people presented as real (a "picture a..." person
   is fine; real historical people only with checked facts).
3. **Story with characters** (made for the v2 cast): two characters with a small conflict or goal (the worker and
   the boss, the kid and the skeptic), at most 1-2 short in-story lines in quotes, the fact is the turn of the story.
4. **Myth-buster / counter-intuitive**: starts from what most people believe, shows why it's wrong or incomplete,
   lands the real answer.
5. **Stakes / scale**: leads with the most striking number, size comparison or "what could go wrong", keeps raising
   the stakes, pays off with the reason.
Every variant follows 1.2 (45 s max incl. its own subscribe line, ~95-115 words, no hype words, no "!", verified facts
only - the same fact sheet for all five, no new claims) and has a different first line. Show for each: the angle,
its hook line, the full script, word count + estimated length, and one line on how it would look (cast, shots, the
payoff visual). Then a short comparison (score 1-5 on hook, clarity, emotion, visual potential, fit for the v2 cast)
and **your recommendation with the reason**. Ask the user to choose: they reply with a number, a mix ("hook of 4 with
the body of 2"), or changes; if AskUserQuestion is available use it with your top pick first marked "(Recommended)"
and the user can type any other number under Other. Only the chosen (or merged) script goes on to 1.3 and section 3.

### 1.3 Script deliverable (show this, then continue)
- a one-sentence description of the idea;
- the complete voiceover, ready to record, no scene directions;
- the narration word count and estimated length;
- links to the sources that support the explanation (and a short note of what is an estimate / single study / unverified).
Then also write the YouTube metadata now or at hand-off (section 13). Done = the user picked one of the five variants
(1.4) and has the final script; proceed unless they want changes.

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
4. Shots (v2): **6-10 shots** for 45 s, each 3-6 s, at varied sizes: extreme wide (the whole place), medium (waist-up
   character), close-up (a face reacting), macro insert (the small detail that proves the fact: a gauge, a gap, a
   crack, a label). Link them with **whip / fly-through transitions** (`Whip`, a dive toward the next subject, a pan
   past a foreground object) placed on sentence starts or strong words, about every 3-5 s; at most 1-2 plain hard
   cuts per video. Change place or scale often (outside -> inside -> close detail -> wide).
5. One gag per beat a kid would laugh at (v2: prefer gags the cast performs - a colour-emotion change, a double take,
   a smug pose, a sweat-drop panic, a character reading a newspaper headline that states the fact): an object comes alive and opens its eyes, gasps "o", squeezes "> <", shivers
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

### 5B. v2 cast: bigger, more expressive, colour emotions (`Cast.tsx` -> `Person`)
- **A small recurring cast** (1-3 people per video, plus objects with faces when useful), each with a **costume
  identity** a viewer reads instantly: role colour (shirt + vest), a hat (`cap`, `bowler`, `top`, `hardhat`, `beanie`),
  hair at the sides, optional mustache / glasses / bandana / buttons. Give them roles that fit the topic (the worker and
  the boss, the scientist and the skeptic, the kid and the grandparent). Invent our own; never reuse another channel's
  characters. Keep each person's costume identical in every shot.
- **Stick limbs** (thin ink strokes, black hands and feet) on a clothed bean torso and a big white head (r 100) with
  thick outline - the head is the stage.
- **Frame them big**: most character shots waist-up or closer (head 25-40 % of frame width); full-body only in wides.
  They look and talk to the camera, lean toward it, react.
- **Expressions** (`eyes`: dot / wide / ring = O-O shocked with pupils / squeeze > < / smug half-lid curve; `mouth`:
  smile / flat / o / open / grin / teeth = clenched toothy / wavy / smirk; `brow` tilt + `browUp`; sweat drop).
  Change expression on the word, hold it, blink on holds.
- **Colour-emotion gags** (`tint` + `tintAmt`, `steam`): anger = face goes `red` or `purple` and steam puffs from both
  sides of the head + teeth mouth; fear = pale `blue`; sick/disgust = `green`. Ramp the tint over 0.3-0.4 s on the
  word, hold, then ramp back. One colour gag per video is a highlight; two at most.
- **Short in-story lines**: the script may give a character one short line in quotes ("This is MY railroad.") when it
  carries a fact or the turn of the story; the voice reads it. Keep narration the main voice; no more than 1-2 lines.
- **Acting**: anticipation and settle on every gesture; idle life on holds (breathing, blinks, a small weight shift);
  hands do things (point at the detail, scratch head, fold arms, hold a prop).

---------------------------------------------------------------------------------------------------------------------
## 6. The world: 2.5D multiplane camera

`Layer.tsx`: every layer is a flat full-frame SVG at depth Z; the camera has (x, y, z); a layer's scale is
k = 1000 / (Z - z). Units: camera (540, 960, 0) shows the Z 1000 layer at 1 world px = 1 screen px. Dollying makes near
layers grow faster than far ones (real depth). Layers closer than `minDepth` (300) are hidden - make sure their content
is already off-screen.
- Depths that worked: stars 5000, clouds/sky 1600, main characters + ground 1000; space shots put the planet at 1000.
  Ground = flat bands with one black profile line; the ground band in front covers the base of anything behind it.
- Camera keys: `camAt(t, [[time, {x, y, s}], ...])` where `s` is the scale of the Z 1000 layer, interpolated in log space
  (even zooms); easeInOutCubic glides of at least 1 s; keys sit on word keys (`K.oceans - 0.4`). The last key equals
  the first (loop).
- **v2: the camera is never still.** Add `drift(t, DURATION, amp)` (smooth hand-held sway: a few px + a fraction of a
  degree of roll + a tiny zoom breath, whole cycles over the duration so the loop holds) to every shot, including holds.
  On holds also keep a slow move going (a 2-5 % push-in or a slow lateral track). On a key word, push in 8-15 % toward
  the subject over 0.4-0.6 s. Big moves are still eased; drift is never random per-frame jitter.
- Depth of field (optional): blur far layers 2.5-3.6 px only while close on a character.
- Keep important things centred and inside the frame when the camera holds; keep labels out of the caption band.
  A half-visible character at the screen edge in a close-up looks like a glitch - keep it fully in or fully out.
- Screen shake = sums of sines times an envelope (a few px), never random per-frame jumps.
- A dive-in (fast push toward the subject) hides a cut nicely.

### 6B. v2 fake 3D (`Depth.tsx`) - make it feel real without a 3D renderer
- **Perspective ground**: for any scene on the ground (roads, rails, floors, fields, corridors, bridges) use a screen-space
  `PCam` {horizon, h (camera height), f (focal), x, z (distance travelled)} with `PerspGround` and `proj(c, X, Z)`:
  edges converge to a vanishing point, repeated marks (dashes, sleepers, planks, fence posts, lamp posts) get closer
  together with distance, so a forward dolly (increase `c.z`) reads as real travel. A **low camera** (horizon at
  700-850, small `h`) gives the dramatic ground-level look; wide lens = larger f range differences.
- **Billboards**: flat cut-outs stand on the ground at (X, Z) via `Billboard` or `proj` -> translate + scale(s): far ones
  small and high, near ones big and low. Sort far -> near. Characters are billboards too (stay flat).
- **Haze / aerial perspective**: wrap far things in `hazeFilter(hazeAt(depth))` (from `<HazeDefs sky=...>`), so they
  fade and tint toward the sky colour. Far multiplane layers get the same treatment.
- **Light**: a warm sun (`SunGlow`) placed in the sky, `LongShadow` under every standing thing pointing away from the
  sun, world objects drawn with a lit side and a shadow side (`shades(base)` -> [lit, base, dark]); a warm late-day
  palette (sky blue -> peach horizon, orange/terracotta ground, purple shadows) is the default mood. Characters keep
  flat colour + the single crescent shade.
- **Texture in code**: `Speckle` (gravel, sand, rock pores), `Strata` (cliff bands, wood grain, layered rock), repeated
  windows / bricks / planks. Texture on the world, never on characters.
- **Foreground**: something close to the lens passing across (a pole, a leaf, a rail bolt, a railing) drawn big and
  blurred (`Foreground`), 1-2 per shot during moves: the cheapest strong depth cue.
- **Scale cues**: many small repeated details shrinking into the distance (people, windows, posts).
- **Depth of field**: blur far layers 2-4 px in close-ups of a character; no blur in wides.

### 6C. v2 transitions (`Whip`, `SpeedLines`)
- `Whip` moves the outgoing and incoming scenes together as one strip (no gap) with directional blur and speed lines,
  0.4-0.6 s, centred on a sentence start or a strong word. Direction follows the story (left = forward in time /
  next place, up = rising, down = diving into detail). Other moves that hide a scene change: a dive into an object
  (radial `SpeedLines`), a pan past a foreground pillar, a match on shape (round face -> round wheel).
- Effects (speed lines, blur) exist only during the move. Sound: a whoosh peaking at the transition centre.

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
8.7 **Captions v2 - one word at a time, strict safe area** (`Captions.tsx`): each spoken word appears alone on its
    word time (pop 0.78 -> 1.08 -> 1 over 0.12 s), Inter 900, white with a 12 px black stroke and a small drop shadow;
    the key words from `story.json` keys in yellow #FFE14D. Font 76 px, auto-shrinks for long words (min 46), one line,
    never wraps. **Safe box (design space 1080x1920): x 140-900, y 1150-1330, centre (520, 1240).** Hard rule: nothing
    of a caption below y 1330 or right of x 900 - the Shorts title, channel name and description cover y > ~1400 and
    the like/comment/share buttons cover x > ~930 (y 860-1400); the top ~200 px is the search/menu bar. Labels, props
    with important text and faces also stay out of those zones. Check with the overlay: render stills with
    `PROPS='{"guides":true}'` (red = covered by the app, green = caption box) and look at every shot.
    (`story.json` chunks are still used for captions.srt and the timing sheet.)
8.8 Exaggeration is for what characters do, never for the facts in labels.
8.9 (v2: keep the button inside y 300-700 and x 140-900.) **Subscribe CTA** (see `Cta` in `examples/water/Short.tsx`): on "Subscribe" a generic red SUBSCRIBE button (no
    platform logo) + bell pops in above the main object (screen y ~360-500, clear of captions), the object looks up at it, a
    cursor flies in; on the next stressed word the cursor clicks: the button squashes, flips to grey "SUBSCRIBED ✓",
    sparkles burst, a click + chime; the bell turns yellow and rings; ~0.75 s before the end the button pops away and the
    object looks back at the viewer so the last frame equals frame 0. Camera settles on its first key by the CTA.
8.10 **Story props (v2)** (`Story.tsx`): let the world carry text - a `Sign` on posts, a `Banner`, a `Newspaper` a
    character holds up (masthead + headline that states the fact or the turn of the story), a `Note`, a calendar, a
    gauge with numbers. Props are drawn in the scene (they move with the camera and get haze/shadow like everything
    else); text at least ~34 px on screen in its shot, true statements only (in-story headlines may be in-world
    phrasing but must not invent facts). Prefer a prop over a floating `Pill` when a natural object can hold the words;
    keep `Pill` for measurements and the honesty tags. Use a **macro insert** shot when the fact is a small detail.
8.11 **Explain with colour**: a physical change can be a colour ramp on the object (cool -> hot: purple -> pink ->
    yellow -> glowing white; pressure building: green -> yellow -> red), plus a measuring prop (ruler, gauge, coin in a
    gap) to make a tiny change readable. Build to one dramatic payoff beat (it breaks, bursts, flies, collapses) that
    lands on the key word, cartoon-safe.

---------------------------------------------------------------------------------------------------------------------
## 9. Sound (code-made)

- **v2 continuous bed**: the video is never silent. `bed(DUR, speech=[(s.start, s.end) for each sentence], bpm,
  mood)` makes a light code-made music bed (pad chords + plucked arpeggio + soft kick/shaker; moods `bright`,
  `curious`, `tense`) that dips about 7 dB under each sentence and comes back up in the pauses; `write_bed(
  f"public/{short}/bed.wav", y)`. Play it in the composition as its own `<Audio>` at about volume 0.16-0.22 (set by
  measurement: bed peaks ~14-18 dB under the voice). Add ambience for the place too (wind, crowd murmur, machine hum)
  so even pauses have texture. Denser sound: every visible action gets a sound (footsteps, cloth, props, UI pops).
- `tools/gen_sfx.py` = the short's cue list using `sfxlib.py` (`init(DUR)`, `add(sound, at, db)`, `write(path, DUR)`):
  pop, plip (drops), whoosh (camera moves, peak on the move), slurp/gurgle (draining), deflate + thud (shrivel), ding
  (labels, measurements), shimmer, sizzle, chatter, splash (refill), breeze bed, click (CTA). Copy
  `examples/water/gen_sfx.py` and rewrite the cues. Every cue time is a word key from `src/timing.json`, so a re-time
  regenerates the sound.
- Levels in the cue list: impacts -6 to -10 dB, pops/dings -10 to -18 dB, whooshes -12 to -20 dB, beds -20 to -24 dB;
  the effects mix is peak-normalised to 0.7 and plays at volume 0.42 under the voice (volume 1, loudness-normalised to
  -16 LUFS before mixing). Big sounds go into pauses, not on top of words. **v2 master**: `retime.sh` renders, then
  `master_audio.py` two-pass loudness-normalises the full mix to **-14 LUFS, true peak <= -1 dBTP** (video copied).
- You cannot hear the result: verify by measurement (section 10) and say so.

---------------------------------------------------------------------------------------------------------------------
## 10. Checks (before the take arrives, and again after)

- **Type check**: `npx tsc -p .` must be clean.
- **Contact sheets**: `node tools/stills.mjs <t1> <t2> ...` (env `COMP`, `SCALE=0.5`, `PROPS`; v2: also one sheet with
  `PROPS='{"guides":true}'` to prove captions/labels avoid the Shorts UI) -> `qa/still_<t>.png`;
  `python3 tools/sheet.py qa/sheet.png qa/still_*.png`. Look at frame 0, every beat (key + 0.3-0.8 s), every cut, every
  label, the CTA, the last frame. Fix framing (labels cut by the frame edge, things in the caption band, crowding) and
  re-check.
- **Preview**: render 0.5x (`npx remotion render src/index.ts Short out/preview.mp4 --scale=0.5 --crf=20`), then
  `python3 tools/qa_video.py out/preview.mp4`:
  - pop scan (caption + tag bands masked): every flag must be an intended cut, pop-in or fast action - list them against
    the beat table; an unexplained isolated spike is a bug;
  - loop: first vs last frame mean abs diff < 0.5 on the preview (< 0.2 at full size). Things that break loops: a drifting
    cloud or breathing that doesn't complete whole cycles over the duration, a state that isn't reset;
  - loudness and audio silences (v2: no silences expected - the bed is continuous; loudness about -14 LUFS after
    mastering);
  - v2 liveliness checks: camera never fully still (pop scan's median motion > 0 on holds), a transition about every
    3-5 s, 6-10 shots, captions inside the safe box on every sheet (guides on).
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
on the final: flags all intended, loop diff < 0.2, loudness about -14 LUFS (mastered), true peak below -1 dBTP, no audio silences (continuous bed). Say sync was verified by measurement and stills, not by ear.

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
- v2: the camera always moves a little; depth from perspective, parallax, haze, light and foreground; a whip or
  fly-through every 3-5 s; the cast acts big and changes colour with emotion; story props carry text; one-word captions
  stay in the safe box; the sound never drops out.
- Everything centred and balanced when the camera holds; nothing important cut by the frame edge; nothing in the
  caption band except captions.
- No cross-fades between drawings, no random jitter. Every move eased; camera glides >= 1 s. Motion blur only as the
  directional blur of a `Whip` (v2).
- One focal action at a time; effects stop when their beat is over.
- Same outline weight family everywhere; flat colours; no gradients on characters.
- Every visual sits on its word; the payoff lands on the last explanation word; the CTA follows; the last frame loops to
  the first.
- Real facts only in the voice and labels; cartoon exaggeration only in what characters do, and labelled.

Pitfalls already met: TypeScript 6 breaks the Remotion 4.0.250 bundler (keep 5.6); `--scale=1.333` gives an odd width
(use `Short2K`); pocketsphinx fails to align 40 s in one pass (align per sentence); words like "adult's" aren't in its
dictionary (fallbacks/`spoken`); a 0.10 s silence threshold mistakes plosives for gaps (use 0.12 s); drifting clouds and
non-integer breathing break the loop (v2: `drift` uses whole cycles - pass the real DURATION); labels near the right edge get cut at wide zooms (check sheets); a thumbnail line
that wraps to three lines crowds the face (nowrap, smaller size for long lines).
