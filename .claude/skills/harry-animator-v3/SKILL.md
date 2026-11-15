---
name: harry-animator-v3
description: (v3 - new permanent look: strictly flat 2D cel characters composited into a stylized, shaded 3D world; smooth camera, clean cuts; everything else as v2) Make a complete faceless YouTube Short (the length the user asks for, 2K vertical 1440x2560, 60 fps) about a surprising fact or "what if" question, end to end - topic (the user's own, a viral-potential topic researched online, or a pasted script to fact-check and make original), five researched and source-checked voiceover script variants with a subscribe line, then an animation made entirely in code with Remotion - flat white-faced line-limb characters acting in a real 3D set (three.js: perspective, material textures, directional light, cast and contact shadows), one-word captions in a strict safe area, code-made sound effects and music bed, animated subscribe ending, seamless loop - re-timed to the user's own voice take, plus thumbnails, captions file, YouTube title, description and tags. Use whenever the user calls harry-animator-v3 (or harry-animator when they ask for v3 / the flat-characters-in-a-3D-world style).
---

# harry-animator v3: researched script -> flat 2D cast acting in a stylized 3D world

**What v3 changes vs v2: only the look.** Topic, research, five script variants, timing, voice take, one-word captions,
sound, checks, re-time, thumbnails, metadata and hand-off are the v2 pipeline unchanged. The picture is new, and it is
permanent: the same rendering method for every story and every shot.

## THE PERMANENT VISUAL STYLE (applies to EVERY story and EVERY shot)

Change the story, characters, clothes, locations and palette between videos, but never the rendering method. Once a
video's cast and setting are established, keep them identical for the whole video.

**CHARACTERS ARE STRICTLY FLAT 2D** (`Cast.tsx` -> `Person`, placed with `<Cel>`):
- Flat illustrated animation cels composited into a dimensional environment.
- Solid white circular faces with thick, consistent dark outlines.
- Flat black oval eyes, separate graphic eyebrows, simple drawn mouths.
- Flat solid-colour hair and clothes. Small narrow torsos, extremely thin black line arms and legs, small flat rounded
  hands, minimal feet.
- No visible thickness, sculpted cheeks, spherical skulls, cylindrical limbs, volumetric clothing, realistic anatomy,
  skin texture, gradients, highlights, or ambient shading on characters.
- Characters may cast ground shadows, but their faces and clothes remain flat and unshaded.
- Turns are redrawn 2D poses (`view` = front / left / right / back), never a rotated solid model and never exposed
  cardboard edges. These are illustrated characters, not physical paper crafts.
- Animate through simple joint rotations, small body bounces, deliberate head tilts, and clear changes of eyebrows,
  eyes and mouths. Keep foot placement and prop contact readable.

**ENVIRONMENTS AND PROPS ARE STYLIZED 3D** (`World3D.tsx` -> `World`, `Box`, `Cyl`, `Ball`, `Ground`, `tex`):
- Fully dimensional scenery with clear perspective, material textures, gentle ambient shading, directional light and
  contact shadows.
- Rich, readable colours; simple modelled architecture and objects; strong foreground / background separation.
- Locations and colours that fit the story. Never default every story to a prison, a laboratory, a pink room or a
  teal corridor - and never to the demo's street or kitchen.
- Smooth camera tracks, dollies, gentle push-ins, high-angle inserts and reaction close-ups. Clean cuts for actions and
  reveals; an occasional short dissolve when it helps the story.
- Keep the flat characters visually distinct from the shaded 3D objects.

**The scenes themselves are silent pictures**: no dialogue, no lip-sync, no speech bubbles, no logos, no watermarks, no
unnecessary written labels inside the scene. Characters express themselves through gestures and faces. (The narration,
the one-word captions, the sound and the subscribe button are separate layers added on top, exactly as in v2.)

**Owner's amendments (15 Nov 2026, after the manchineel Short) - these override the lines above where they differ:**
- **Faces change colour with the situation.** White is the resting colour, not a fixed rule: poisoned or sick = green,
  burning / hot / furious = red (with steam puffs), freezing or terrified = pale blue, and so on. The colour is one
  flat fill (`tint`, `tintAmt` on `Person`) ramped over 0.3-0.4 s on the word, held, then ramped back - still no
  gradients, shading or highlights. Use it whenever the story gives a reason, not as decoration.
- **No unnecessary written labels** stays: cutaway explanation shots carry no text; the picture itself explains.
- **Environments stay code-built 3D** (no generated or painted background images), made as rich as code allows: see
  section 6 "Richness".
- **One picture per caption phrase, one layer deep** (section 3.4-3.5): something new happens on screen every
  1.5-2.5 s, and each fact gets a 1-2 s cutaway that shows how it works.
- **The length is asked every time** (section 0); there is no fixed 45 s limit.

**Restate the look concretely for every shot.** In `story.json` every shot gets a `look` line written out in full -
who is in it (name, clothes colours, hair), the place, its materials and palette, the light direction, the camera move.
Never write "same style as before". **Never drift into**: rounded 3D characters, anime faces, photoreal people,
whiteboard animation, or flat vector environments (no flat SVG backdrops, no 2D parallax layers - the set is always
real 3D meshes).

What this makes: a vertical Short (designed at 1080x1920, delivered **1440x2560 (2K), 60 fps, at the length the user asked for**). **All
of it is code**: the cast is React SVG, the world is three.js meshes with code-drawn textures, and motion, camera,
captions, sound and timing are code too. The voice is the user's own take (recorded or made in their own voice tool)
and the video is re-timed to it word by word.

Worked example: `examples/v3-demo/Short.tsx` (8 s: a market street with a dolly and push-in, a clean cut on the
action, a kitchen with a high-angle insert that moves into a reaction close-up, a table edge passing in front of the
character, a 3D mug in a flat hand, real cast shadows). Copy its patterns, never its content. `examples/water/` holds
only pipeline files from an older video (`story.json`, `timing.json`, `gen_sfx.py`, `youtube.md`) - use them for file
formats and the sound cue list, not for the look.

Read the whole file once before starting. Follow the order; each step says what "done" looks like. Never name or
recommend a specific image-generation or voice service in anything you write for the user (say "your voice tool").

Folder map (`<SKILL>` = this skill's base directory):
- `scripts/` - `new_project.sh` (makes a project), `gen_timing.py`, `align_take.py`, `sfxlib.py` (incl. `bed()` /
  `write_bed()`), `gen_sheet.py`, `make_captions.py`, `stills.mjs`, `sheet.py`, `thumbs.mjs`, `qa_video.py`,
  `retime.sh`, `master_audio.py`
- `templates/remotion/` - package.json (pinned versions, incl. three + @react-three/fiber + @remotion/three),
  remotion.config.ts, tsconfig, `src/`: **`World3D.tsx`** = the 3D world (`World`, `Cel`, `cam3At`, `toScreen`,
  `celPoint`, `Box` / `Cyl` / `Ball` / `Ground`, `tex`, `Light`, `Cuts`, `Dissolve`), **`Cast.tsx`** = the flat
  `Person`, `Captions.tsx` = one-word safe-area captions + `SafeGuides`, `Cta.tsx` = `Cta` subscribe button,
  `ThumbText`, `Tag`, `Bits.tsx` = `Puff` / `Pill` / `Bracket` / `Sparkle` (flat screen-space effects), `Layer.tsx` =
  outline scale, `math.ts`, `color.ts`, `Root.tsx`
- `examples/v3-demo/` - `Short.tsx`, `timing.json`; `examples/water/` - pipeline file formats only
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

**Then ask the length, every time** (a second question, never assumed): "How long should this Short be?" - offer 30 s,
45 s, 55 s and let them type any other number. That number is `LIMIT` for the whole job: the finished video including
the subscribe line must not exceed it. Words to write = about 2.7 x the seconds of speech (LIMIT minus 0.4 s lead-in
and 1.6 s tail): 30 s = ~75 words, 45 s = ~115, 55 s = ~145. Every "45 s" in this file means `LIMIT`.

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
  a small flat cast acting in a simple 3D place (people react, things grow/shrink/drain/break, a size comparison,
  a before/after);
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
  idea and structure where they work, fit it to `LIMIT` including the subscribe line. Show what changed and why (a short list).

### 1.1 Fact-checking (all routes)
- Verify the central fact with reliable sources: original research papers, universities, museums, government agencies
  (NASA, NOAA, USGS, NIH...), established scientific organisations. Cross-check the explanation with a second source.
- Do not invent facts, numbers, quotes or consequences. Keep uncertainty where it matters ("about", "estimated", "one
  study found"). If a popular version of the fact conflicts with the official source, script around the part that holds
  up and tell the user what could not be verified. Note which figures are estimates or single studies.
- Cartoon exaggeration is fine in what the characters *do*; the voice states only real facts.

### 1.2 Writing (all routes)
- Length: **the finished Short is at most `LIMIT`** (the length the user chose in section 0) including the subscribe
  line (~8-10 words, 2-3 s); word budget as given there.
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

### 1.4 Five script variants (every route)
After the research and fact-check (one shared fact sheet), write **5 complete, recordable scripts** for the same topic,
each from a clearly different angle. Route 3 (the user's script): keep the user's idea and verified facts, and make 5
engaging rewrites of it at these angles (plus the "what changed" list from 1B, once). Route 2: after picking the topic,
same 5 angles. The five angles (one script each):
1. **Curious / what-if**: opens on a question or a "what would happen if", builds by consequences, clean answer.
2. **Emotional / human**: told through a person's feeling or stakes (a worker, a kid, a family, someone in history);
   warm, makes you care, still factual - no melodrama, no invented people presented as real (a "picture a..." person
   is fine; real historical people only with checked facts).
3. **Story with characters** (made for the cast): two characters with a small conflict or goal (the worker and
   the boss, the kid and the skeptic), told by the narrator only - the characters never speak (no quoted lines, no
   lip-sync); they act it out. The fact is the turn of the story.
4. **Myth-buster / counter-intuitive**: starts from what most people believe, shows why it's wrong or incomplete,
   lands the real answer.
5. **Stakes / scale**: leads with the most striking number, size comparison or "what could go wrong", keeps raising
   the stakes, pays off with the reason.
Every variant follows 1.2 (`LIMIT` max incl. its own subscribe line, the word budget from section 0, no hype words, no "!", verified facts
only - the same fact sheet for all five, no new claims) and has a different first line. Show for each: the angle,
its hook line, the full script, word count + estimated length, and one line on how it would look (cast, shots, the
payoff visual). Then a short comparison (score 1-5 on hook, clarity, emotion, visual potential, fit for a silent acting cast)
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
bash <SKILL>/scripts/new_project.sh <workdir>/<short-name>-short <short-name> --example  # with the v3 demo to study/run
```
It copies the Remotion template to the project root, the scripts to `tools/`, runs `npm install` (pinned:
remotion + @remotion/three 4.0.250, three 0.170.0, @react-three/fiber 8.17.10, react 18.3.1, typescript 5.6.3 -
TypeScript 6 breaks this Remotion's bundler; fiber 9 needs React 19, keep 8), and checks
numpy / pillow / opencv / ffmpeg. Put the project inside the user's primary working directory so they can open files.
Project layout: `story.json`, `src/` (components + `timing.json`), `tools/`, `voiceover/` (script.txt, timing sheet,
take/, captions), `public/<short>/` (vo.wav, sfx.wav only), `qa/`, `out/`, `thumbnails/`.
The demo is copied to `reference/v3-demo-Short.tsx` in every project.
Cloud sandbox notes: Remotion uses the pre-installed headless Chromium when present (config auto-detects). The 3D
world needs WebGL: with no GPU only the software renderer works (`swangle`, the default in `remotion.config.ts`,
`stills.mjs` and `thumbs.mjs`; set env `GL=angle` on a machine with a GPU). Measured on 4 cores without a GPU: about
0.2 s per frame for a half-size preview, about 0.65 s per frame at 2K with `--concurrency=4` (a 45 s Short = about 30
min). Run renders in the background; Hugging Face is usually blocked, so word times come from
forced alignment with pocketsphinx (its wheel ships the English model), installed in a venv by `retime.sh`.

---------------------------------------------------------------------------------------------------------------------
## 3. Script -> beat sheet -> story.json

1. Split into sentences (one voice sentence = one or two caption chunks of 2-6 words, split where a speaker breathes).
2. One visual beat per line, on the exact word ("vanished" = the oceans drain, "shrivel" = he shrivels, "nine" = the row
   of nine balls). Name each beat as a key word.
3. Frame 0 states the premise like a thumbnail (the main character and the thing the story is about, centred, big,
   readable). No intro, no rewind.
4. **One picture per caption phrase.** Go through the script phrase by phrase (every 2-6 words, the caption chunks)
   and give EACH phrase its own visible event: a new shot, a new camera position, or a clear new action in the same
   shot. Something new on screen every 1.5-2.5 s; no shot is held longer than about 4 s without a change. A 50 s
   video therefore has roughly 20-30 pictures (not 9). Write them as a table: phrase -> what we see -> shot size.
   Sizes, varied: wide establishing (rare, 1-3 per video), medium waist-up (the default - the character fills
   40-60 % of the frame height), reaction close-up (a face fills most of the width), high-angle insert, and cutaways.
   **The hook shows the consequence**: within the first 3 s the picture already shows what goes wrong (the character
   does the thing and suffers), then the story rewinds into the explanation.
   **Clean cuts** between pictures (cut on the word); one smooth camera move inside each; at most 1-2 short
   dissolves; no whip pans, speed lines or shake as a style. A video has 1-3 places, each with its own palette.
5. **One layer deep.** Every fact in the script gets one short cutaway (1-2 s) that shows HOW it works, one level
   below what the eye sees - never a lecture, never two levels. Build them in the same style (3D objects, flat
   characters) and **without text**:
   - a macro of the thing (the leaf with its veins and a white drop forming at the tip);
   - a cross-section (skin layers with the sap soaking in; the trunk with sap channels; the ground under the root);
   - a see-through body (the character as a flat blue silhouette with the affected part glowing: throat, stomach,
     lungs) - the cartoon "X-ray";
   - a heat view (dark scene, the hot part ramping purple -> orange -> yellow) with a 3D gauge needle or bar that
     rises instead of a number;
   - a map or aerial view (the island from above with a marker pin; a storm cloud mass sliding in);
   - a comparison prop (a row of copies, a ruler, the object next to a known thing);
   - a mark made of shapes (red X shapes popping onto the things that are dangerous) - marks are not text.
   One gag per beat on top, performed by the cast with body, face and face colour: a double take, a head tilt,
   eyebrows shooting up, a jaw drop "o", squeezed "> <" eyes, a slump, a smug closed-eye smile, a sweat drop, a
   jump, the face going green / red with steam / pale blue. And one physical event per beat in the 3D world.
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
 "beats": {"vanished": "the pond drains to cracked mud, Mia's jaw drops", "...": "..."},
 "cast": {"Mia": "orange shirt #E4572E, dark brown ponytail", "Otto": "blue shirt, yellow vest, navy cap, grey moustache"},
 "shots": [{"from": "start", "to": "vanished", "size": "wide", "camera": "slow dolly in, eye level",
   "look": "FLAT 2D cel characters (solid white round faces, thick dark outline, black oval eyes, graphic brows, thin black line limbs, flat solid-colour clothes, no shading) in a STYLIZED 3D set: Mia (orange shirt, brown ponytail) on a wooden jetty over a round pond, green speckled grass, three leafy trees, warm afternoon sun from the upper left casting long soft shadows, pale blue sky fading to cream at the horizon"}]}
```
   `keys`: name -> [sentence index, word] (first occurrence in that sentence; punctuation stripped, hyphens removed:
   "what-if" -> "whatif"). `cast` and `shots[].look` are the style card: write every `look` in full (never "same as before") and build
   each shot from its line. `spoken`: how numbers / unusual words are pronounced (for the aligner). `syllables`: overrides
   for the estimate.
8. Estimate the timing: `python3 tools/gen_timing.py story.json --out src/timing.json` (4.7 syllables/s = natural
   conversational pace, +0.2 s after a comma, +0.5 s after a sentence, first word at 0.4 s, 1.6 s tail). If the estimate
   is over `LIMIT` - 1 s, shorten the script now.
Done = the phrase table (phrase / what we see / size / sound), every fact with its one-layer cutaway, story.json
(with cast + a full `look` per shot) + estimated timing.json.

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
## 5. The cast: flat 2D cels (`Cast.tsx` -> `Person`)

Everything alive is a flat SVG drawing. Study `templates/remotion/src/Cast.tsx`; add to it, never around it.
- **Anatomy** (fixed): round head (r 100; white at rest, flat situation colour when the story calls for it) with one thick dark outline; flat black oval eyes; separate
  curved eyebrow strokes; a simple drawn mouth; flat solid-colour hair (`short`, `sides`, `long`, `bun`, `ponytail`) and
  an optional flat hat / glasses / moustache / scarf; a small narrow flat-colour torso (`shirt`, optional `vest`,
  `buttons`); extremely thin black line arms and legs; small flat white rounded hands; minimal black feet. Feet at
  (0,0), about 430 units tall.
- **Never on a character**: gradients, highlights, crescent shades, textures, blur, drop shadows, 3D
  transforms, perspective skew, visible thickness.
- **Face colour follows the situation** (`tint` = any flat colour, `tintAmt` 0..1, `steam` 0..1): white at rest;
  green = poisoned / sick, red + steam = burning / hot / furious, pale blue = freezing / terrified, yellow-green =
  queasy, purple = out of breath. Ramp over 0.3-0.4 s on the word, hold, ramp back when it passes. `spots` adds flat
  red dots (rash, blisters, stings). Clothes may be a flat pattern (dots, flowers, stripes) - flat shapes only. A character is the same flat drawing in a wide and in a close-up.
- **Outline**: every stroke is `px / useK()` (9 px body outline, thinner limbs); `<Cel>` sets `k`, so the outline keeps
  one consistent on-screen weight across shots and only thins when a character is small in a wide.
- **A cast per video** (1-3 people): each has a role colour, hair and one accessory a viewer reads instantly; define
  each outfit once as a constant and reuse it in every shot. New cast, clothes and colours for every video.
- **Turns are redrawn poses**: `view="front" | "left" | "right" | "back"` (the face slides, the far eye narrows, feet
  and cap peak point that way; `back` hides the face). Switch view on a step change (`pick`), never by scaling x
  through zero, never by a 3D rotation. `faceDx/faceDy` and `lookX/lookY` give small looks within a view.
- **Acting** (the only ways a character moves): joint rotations = moving `handL/handR/footL/footR` (the line limbs
  follow), `bounce` (small body lift, feet stay), `lean`, deliberate `headTilt`, and clear changes of `brow` / `browUp`,
  `eyes` (`dot`, `wide`, `squeeze`, `closed`), `mouth` (`smile`, `flat`, `frown`, `o`, `open`, `grin`, `teeth`, `wavy`,
  `smirk`), `blink`, `sweat`. Change expression on the word, hold it, blink on holds. Anticipation before a gesture and
  a small settle after (`spring`). No mouth flapping to the narration: the mouth is an expression, not speech.
- **Walking**: move the `<Cel at>` along the ground and alternate the feet with the same phase (`sin`) plus a small
  `bounce`, so each foot plants and does not slide (step length = distance travelled per half cycle). Stop the cycle
  when the character stops.
- **Framing**: most shots waist-up or closer; full body in wides. Characters look at each other, at the prop, or at
  the lens for a reaction. Fully in frame or fully out - a half-cut face at the edge reads as a glitch.
- Animals or creatures, if a story needs them, follow the same rules: flat white or flat-colour shapes, thick outline,
  black oval eyes, line limbs. Objects never get faces in v3: objects are 3D props.
Done = every character checked on a contact sheet in every view and expression the story uses.

---------------------------------------------------------------------------------------------------------------------
## 6. The world: stylized 3D sets (`World3D.tsx`)

Units are metres, Y is up, the floor is y = 0. A shot is one `<World>`:
```tsx
<World cam={cam} light={LIGHT} sky={['#6DB7F2', '#F6E7D2']}
  scene={<>...3D meshes: the set and its props...</>}
  front={<>...3D meshes that must pass in front of the characters...</>}>
  <Cel at={[x, 0, z]} h={1.7}><Person id="mia" outfit={MIA} ... /></Cel>
</World>
```
- **Model simply**: build places from `Box` (rounded edges `r`), `Cyl` (posts, cones, cups, wheels), `Ball`
  (foliage, fruit, domes, boulders) and `Ground` (floors, roads, water sheets), grouped with `<group position rotation
  scale>`. `Box` and `Cyl` stand ON their `pos`. Readable silhouettes, few big forms, then small repeated details
  (windows, planks, stones, fruit) that shrink into the distance. Any three.js / react-three-fiber mesh is allowed
  when a shape needs it (`<mesh><torusGeometry/>...`, `ExtrudeGeometry`, `LatheGeometry`).
- **Materials**: every surface gets a colour and usually a code-drawn texture: `tex('speckle' | 'planks' | 'bricks' |
  'tiles' | 'checker' | 'stripes' | 'grass' | 'panels', [repeatX, repeatY], seed)`; add kinds to `tex` when a story
  needs one (water ripples, fabric, metal plates). `rough` 0.85 for matte, 0.3-0.5 for glazed or metal, `glow` +
  `emissive` for lamps, screens and windows. Keep one texel scale per material across the set.
- **Light** (`Light`): one directional sun or key light (`sun` = direction toward it, `sunColor`, `sunI`) that casts
  real shadows, plus a hemisphere fill (`sky` colour from above, `bounce` colour from the floor, `ambI`) for gentle
  ambient shading, plus `fog` for aerial perspective. Set `focus` to the action and `span` just wide enough (6-14 m)
  so shadows stay crisp. Pick the light for the story's time and mood: noon, golden hour, overcast, a lamp-lit room,
  moonlight - not one default.
- **Palette**: rich and readable, chosen per story and per place (3-5 main colours + neutrals). The cast's clothes
  must stand out from the set behind them: check value and hue contrast on the contact sheet.
- **Depth**: clear perspective lines (a road, floorboards, a row of posts), something near the lens, the action in
  the middle, something far; fog only on the far part. Indoors: a floor, 2 walls, a window or door, furniture.
- **Characters in the world** (`<Cel at h>`): a flat drawing standing at a 3D point, always facing the lens, scaled
  by perspective, sorted far to near automatically. The world gives each one a real cast shadow and a soft contact
  shadow (the character itself stays unshaded). `lift` raises it for a jump or a climb (the shadow stays on the
  floor). Stand characters on floors that exist, with their feet inside the frame in wides.
- **Contact with props**: `celPoint(cam, at, h, [x, y])` gives the 3D position of a point of the drawing (a hand), so
  a 3D prop can sit exactly in a flat hand; put held props, table edges, counters, doorframes and anything else that
  must cover part of a character into `front` (it is drawn again above the characters). Keep contact readable: the
  hand reaches the prop before it moves, feet stay planted while the body acts.
- **Camera** (`cam3At(t, [[time, {pos, look, fov}], ...])`): a real perspective camera. Eye level 1.4-1.7 m for
  conversation, 3-5 m looking down for a high-angle insert, fov 24-30 for close-ups, 32-40 for wides. Every shot moves
  smoothly: a slow dolly in or out, a lateral track (move `pos` and `look` together), a gentle push-in on the key word
  (5-10 % over 0.5-0.8 s), a crane down from the insert to the face. Eased glides of at least 1 s; no hand-held
  wobble, no whip, no roll. Keys sit on word keys (`K.word - 0.4`); the last camera equals the first (loop).
- **Editing**: `<Cuts t shots={[[0, <A/>], [K.x, <B/>], ...]}>` = clean cuts on actions and reveals;
  `<Dissolve t at a b>` = a 0.25-0.4 s dissolve, 1-2 per video at most.
- **Richness** (the set must feel lush, not like a few primitives): a sky with 3D cloud clusters (soft white `Ball`
  groups, slowly drifting whole cycles) and a low sun disc with a glow; sea with 2-3 animated foam lines and a
  darker far band; ground with a second texture layer and scattered small things (fallen leaves, fruit, shells,
  pebbles, tufts of grass - 30-80 instanced pieces); trees with a branch structure and a crown of hundreds of
  individual leaf cards (one `InstancedMesh` of small double-sided planes in 2-3 greens around the branch tips) plus
  fruit; a soft blur on the far background in close-ups (CSS `filter: blur` on a separate far `World` is not allowed -
  use fog and smaller far detail instead); a distinct palette per time of day (pink-orange dawn, saturated noon,
  deep blue night with a warm fire or lamp glow). Use `InstancedMesh` for anything repeated more than ~40 times
  (rain, leaves, pebbles): separate meshes made the storm shots several times slower.
- **Keeping the two looks apart**: nothing flat pretends to be scenery (no SVG backdrops, hills, buildings, clouds
  as flat shapes); nothing shaded is drawn on a character. Flat screen-space effects from `Bits.tsx` (a `Puff` of
  dust or steam, a `Sparkle`) are allowed only as brief accents on an action.
Done = a contact sheet of every shot's first and last frame: perspective reads, the light direction and shadows are
consistent within a place, the cast separates from the background.

---------------------------------------------------------------------------------------------------------------------
## 7. Animating

- Everything is a number keyed on word times: `kfs(t, [[time, value], ...])` (smoothstep), `pick` for step changes
  (views, mouth shapes, eye types), `pop` (overshoot pop-in), `popOut`, `spring` (damped settle), `bump`.
- Characters: section 5 (joint rotations, bounces, head tilts, face changes). One clear pose change per beat, held.
- 3D props move as solid things: slide, tip, roll, fall on an arc (gravity parabola), bounce once with a small
  squash (`scale`), settle with `spring`; a liquid is a `Ground` sheet or a `Cyl` whose height eases; growth and
  shrinking are `scale` about the base. Things appear by entering, rising, or being revealed by a cut - not by fading.
- Life on holds: blinks, a breath (`bounce` of 2-3 units, whole cycles over the duration), a small head tilt, eyes
  following the action; in the world: a slow sway of foliage (`rotation`), a turning sign, drifting 3D clouds.
- One focal action at a time; effects stop when their beat is over. No random per-frame jitter anywhere.

---------------------------------------------------------------------------------------------------------------------
## 8. Effects, labels, captions, CTA

8.1 **In the scene, no writing by default.** No floating labels, speech bubbles, logos or watermarks. Show numbers
    with things instead: a row of copies for a size comparison, a gauge needle, a pile that grows, a ruler prop, a
    character counting on raised hands. Use a `Pill` label only when a number cannot be shown any other way and the
    voice says it at that moment (exactly as spoken), and pop it out when the beat ends.
8.2 Honesty tags: when a drawing is far from scale, a small top `Tag` "not to scale"; when a comparison is truly to
    scale, "drawn to scale". These are necessary labels - keep them, also on thumbnails.
8.3 Liquids, smoke, fire, heat in the world are 3D: translucent `Ground` / `Cyl` sheets (`opacity`, low `rough`),
    clusters of `Ball`s that grow and drift for smoke or steam, emissive meshes (`glow`) for fire, lava, lamps.
    A change of state can be a colour ramp on the material (cool -> hot, green -> yellow -> red) with `mix`.
8.4 Exaggeration is for what characters do, never for the facts.
8.5 **Captions - one word at a time, strict safe area** (`Captions.tsx`, unchanged from v2): each spoken word appears
    alone on its word time (pop 0.78 -> 1.08 -> 1 over 0.12 s), Inter 900, white with a 12 px black stroke and a small
    drop shadow; the key words from `story.json` keys in yellow #FFE14D. Font 76 px, auto-shrinks for long words (min
    46), one line. **Safe box (design space 1080x1920): x 140-900, y 1150-1330, centre (520, 1240).** Nothing of a
    caption below y 1330 or right of x 900 - the Shorts title, channel name and description cover y > ~1400, the
    like / comment / share buttons cover x > ~930 (y 860-1400), the top ~200 px is the search / menu bar. Frame faces
    and the key prop above the caption box (y 250-1100) and out of those zones. Check with the overlay: render stills
    with `PROPS='{"guides":true}'` (red = covered by the app, green = caption box) and look at every shot.
    (`story.json` chunks are still used for captions.srt and the timing sheet.)
8.6 **Subscribe CTA** (`Cta.tsx`: `<Cta t tIn tClick tBell tOut />`, a screen overlay inside y 300-700, x 140-900): on
    "Subscribe" a generic red SUBSCRIBE button (no platform logo) + bell pops in above the main character, who looks
    up at it (`faceDy`, `lookY`, raised brows); a cursor flies in and clicks on the next stressed word: the button
    squashes, flips to grey "SUBSCRIBED", sparkles burst, a click + chime; the bell turns yellow and rings; about
    0.75 s before the end the button pops away and the character looks back at the viewer so the last frame equals
    frame 0. The camera is back on its first key by the CTA.
8.7 Build to one payoff beat (it breaks, bursts, tips, floods, lights up) that lands on the key word, cartoon-safe,
    with the cast reacting in a close-up right after a clean cut.

---------------------------------------------------------------------------------------------------------------------
## 9. Sound (code-made)

- **Continuous bed**: the video is never silent. `bed(DUR, speech=[(s.start, s.end) for each sentence], bpm,
  mood)` makes a light code-made music bed (pad chords + plucked arpeggio + soft kick/shaker; moods `bright`,
  `curious`, `tense`) that dips about 7 dB under each sentence and comes back up in the pauses; `write_bed(
  f"public/{short}/bed.wav", y)`. Play it in the composition as its own `<Audio>` at about volume 0.16-0.22 (set by
  measurement: bed peaks ~14-18 dB under the voice). Add ambience for the place too (wind, crowd murmur, machine hum)
  so even pauses have texture. Denser sound: every visible action gets a sound (footsteps, cloth, props, UI pops).
- `tools/gen_sfx.py` = the short's cue list using `sfxlib.py` (`init(DUR)`, `add(sound, at, db)`, `write(path, DUR)`):
  pop, plip (drops), whoosh (fast actions; a soft one on a cut to a new place), slurp/gurgle (draining), deflate + thud (shrivel), ding
  (labels, measurements), shimmer, sizzle, chatter, splash (refill), breeze bed, click (CTA). Copy
  `reference/example-gen_sfx.py` (= `examples/water/gen_sfx.py`) to `tools/gen_sfx.py` and rewrite the cues. Every cue time is a word key from `src/timing.json`, so a re-time
  regenerates the sound.
- Levels in the cue list: impacts -6 to -10 dB, pops/dings -10 to -18 dB, whooshes -12 to -20 dB, beds -20 to -24 dB;
  the effects mix is peak-normalised to 0.7 and plays at volume 0.42 under the voice (volume 1, loudness-normalised to
  -16 LUFS before mixing). Big sounds go into pauses, not on top of words. **Master**: `retime.sh` renders, then
  `master_audio.py` two-pass loudness-normalises the full mix to **-14 LUFS, true peak <= -1 dBTP** (video copied).
- You cannot hear the result: verify by measurement (section 10) and say so.

---------------------------------------------------------------------------------------------------------------------
## 10. Checks (before the take arrives, and again after)

- **Type check**: `npx tsc -p .` must be clean.
- **Contact sheets**: `node tools/stills.mjs <t1> <t2> ...` (env `COMP`, `SCALE=0.5`, `PROPS`, `GL`; also one sheet with
  `PROPS='{"guides":true}'` to prove captions/labels avoid the Shorts UI) -> `qa/still_<t>.png`;
  `python3 tools/sheet.py qa/sheet.png qa/still_*.png`. Look at frame 0, every beat (key + 0.3-0.8 s), every cut, every
  label, the CTA, the last frame. Fix framing (labels cut by the frame edge, things in the caption band, crowding) and
  re-check.
- **Preview**: render 0.5x (`npx remotion render src/index.ts Short out/preview.mp4 --scale=0.5 --crf=20 --concurrency=4`), then
  `python3 tools/qa_video.py out/preview.mp4`:
  - pop scan (caption + tag bands masked): every flag must be an intended cut, pop-in or fast action - list them against
    the beat table; an unexplained isolated spike is a bug;
  - loop: first vs last frame mean abs diff < 0.5 on the preview (< 0.2 at full size). Things that break loops: a drifting
    3D cloud, swaying foliage or breathing that doesn't complete whole cycles over the duration, a state that isn't reset;
  - loudness and audio silences (v2: no silences expected - the bed is continuous; loudness about -14 LUFS after
    mastering);
  - v3 style checks on the sheets, shot by shot: characters flat (no shading or gradients; face colour only where the story calls for it), the set is
    shaded 3D with visible texture, light and cast shadows; every character has a ground shadow; the cast reads
    against the background; a smooth camera move in every shot (pop scan's median motion > 0 on holds); a new
    picture or action every 1.5-2.5 s (list the cuts: each is one expected pop flag), every fact with its one-layer
    cutaway, the consequence visible in the first 3 s; captions inside the safe box (guides on);
    cast, clothes and set identical across the shots of one place.
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
drawn at 4/3 - a fractional `--scale` gives an odd width and fails; the cast is vector and the 3D canvases
render at 4/3 resolution through `ResCtx`, so both stay sharp).
If the printed sentence pauses are wrong (a take with long comma pauses, or a very short sentence such as "Don't."
fools the estimate - symptoms: a one-word sentence lasting seconds, "aligner failed" on several sentences), list the
real pauses (`ffmpeg -af silencedetect=noise=-35dB:d=0.1`), pick the one after each sentence and pass them:
`BOUNDS=3.44,4.15,... tools/retime.sh take.wav` (one time per sentence gap, in seconds). If the take is a few seconds
over the length limit, shorten only its sentence pauses to about 0.4 s (keep the original take, tell the user).
Before rendering: read the aligned words (sentence pauses should match `ffmpeg silencedetect`), check the duration is
<= `LIMIT` (if not: ask for a faster take or cut a sentence), re-render contact sheets on the real timing.
Render in the background (about 30 min for 45 s on 4 cores without a GPU, `CONC=4`) and wait for it. If a tab
times out creating its 3D canvas, lower `CONC`.
**Verify the file**: 1440x2560, 60 fps, frame count = duration x 60, audio present and as long as the picture, `qa_video.py`
on the final: flags all intended, loop diff < 0.2, loudness about -14 LUFS (mastered), true peak below -1 dBTP, no audio silences (continuous bed). Say sync was verified by measurement and stills, not by ear.

---------------------------------------------------------------------------------------------------------------------
## 12. Thumbnails (three variants)

- `Thumb` composition (`variant` A/B/C) renders a chosen moment from the same components with no tags in the way + big
  text; `SCALE=2 node tools/thumbs.mjs A B C`, then save 1080x1920 JPGs (quality 93) with PIL.
- Text: at most five words, Inter 900, white line + yellow line, 26-30 px #111 stroke, drop shadow, `white-space: nowrap`,
  inside the safe zone (x 90-990, y ~285-1635), never over the main face. Every claim must be true for the video; keep
  "drawn to scale" / "not to scale" tags.
- Concepts: (A) the premise moment with the main character's shocked face next to the thing; (B) the funniest
  character reaction in close-up; (C) the key size comparison or payoff event as the hero. Text via `ThumbText`; the
  picture is a frame of the video (flat cast in the 3D set), never a different style. Check all three at phone-feed size (216x384) on one
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
- that exaggerated visuals are labelled, and that the look follows the permanent style (flat cast, 3D world);
- that alignment assumes the take reads the script as written (a misread word still shows the script word);
- that you can't hear the result, and the user should watch once with sound before posting;
- if the length is over `LIMIT`, how to fix it (faster take, cut a sentence).
Append the topic to `topics_log.md`.

---------------------------------------------------------------------------------------------------------------------
## 15. Rules that keep it on style

- Characters: flat, round faces (white at rest, flat situation colour when called for), thick dark outline, black oval eyes, graphic brows, thin line limbs, flat
  solid-colour hair and clothes. No shading, gradient, highlight or thickness on them, in any shot.
- World: real 3D meshes with texture, ambient shading, one directional light, cast and contact shadows, fog for
  distance. No flat vector scenery, no 2D parallax backdrops.
- Never: rounded 3D characters, anime faces, photoreal people, whiteboard animation, objects with faces.
- New cast, clothes, place and palette for every video; identical cast and set within a video.
- Smooth camera in every shot (track, dolly, gentle push-in, high-angle insert, reaction close-up); clean cuts on
  actions and reveals; at most 1-2 short dissolves; no whips, speed lines or shake.
- Scenes carry no dialogue, lip-sync, speech bubbles, logos, watermarks or unnecessary labels; honesty tags stay.
- Frame 0 = the premise, centred, big, readable; the first spoken line names what you see.
- Feet planted, hands reach props before they move, one focal action at a time.
- One-word captions in the safe box; the sound never drops out; every visual on its word; the payoff on the last
  explanation word; the CTA follows; the last frame loops to the first.
- One picture per caption phrase; one layer deep on every fact; no text in cutaways; the hook shows the consequence.
- The length is whatever the user answered in section 0.
- Real facts only in the voice; cartoon exaggeration only in what characters do.
- Every shot's `look` line in `story.json` restates the style in concrete words.

v3 pitfalls already met: the 3D canvas must draw exactly once per video frame (`frameloop="never"` + `advance` inside
`World3D.tsx`'s `Rig`, guarded by `delayRender`) - a free-running render loop made every frame ~18x slower on software
WebGL and is not deterministic, so never replace `World` with a bare `<Canvas>`; only `--gl=swangle` creates a WebGL
context in a GPU-less sandbox (`angle`, `egl`, `swiftshader` fail); `@react-three/fiber` 9 needs React 19 (keep 8.17);
a vertical frame is narrow - at eye level a 34 degree lens shows only about 2 m of width at 6 m, so stage two
characters within about 1.2 m of each other or pull the camera back; a close-up lens too near the face makes the head
overflow the frame (keep the head under about 75 % of the width); a hat or fringe shape must be clipped to the head
disc or a sliver of white shows above it; a moustache hides `grin` / `open` mouths - use `smile` on that character;
everything in `front` covers the characters wherever it is in depth, so only put things there that really are nearer
the lens than every character they overlap; a `Pill` (or any SVG element) outside an `<svg>` silently doesn't render -
put flat extras as children of `<World>` (they are drawn in its SVG layer).
Pitfalls kept from v1/v2: a closing quote after the full stop used to hide the sentence end (handled in
`gen_timing.py` / `align_take.py`); when a component switches between differently shaped drawings (eye styles, mouth
shapes), give each style its own React `key` - with `--concurrency` > 1 each tab renders non-contiguous frames and
in-place patching left stale SVG attributes; a JPEG-intermediate H.264 frame differs from the PNG still by ~1-1.5
mean, so judge the loop on lossless stills (`stills.mjs 0 <last frame time>`, target < 0.2); anything visible in the
first / last shot must return exactly - idle motion needs whole cycles over the duration and story leftovers must
leave before the end; TypeScript 6 breaks the Remotion 4.0.250 bundler (keep 5.6); `--scale=1.333` gives an odd width
(use `Short2K`); pocketsphinx fails to align 40 s in one pass (align per sentence); words like "adult's" aren't in its
dictionary (fallbacks / `spoken`); a 0.10 s silence threshold mistakes plosives for gaps (use 0.12 s); a thumbnail
line that wraps to three lines crowds the face (nowrap, smaller size for long lines).
