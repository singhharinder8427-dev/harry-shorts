---
name: "harry-animator-v3"
description: "THE DEFAULT harry-animator. Use for ANY request to make a faceless YouTube Short, a what-if / surprising-fact Short, a script plus animation, or when the user says \"harry-animator\", \"/harry-animator-v3\" or \"make a Short\" without naming an older version. Makes the complete Short (2K vertical, 60 fps, the length the user asks for) end to end - topic (theirs, a researched viral topic, or a pasted script to fact-check), five source-checked script variants, then an animation made in code with Remotion in one look - flat 2D cel characters in a shaded 3D world (three.js) - with a bright, already-moving first frame and 6-8 word hook text, a flash-forward hook, an event on every caption phrase, a side-by-side why shot, mood colours, a crown-the-winner finale, one-word captions, code-made sound and music, subscribe ending, seamless loop, re-timed to the user's voice take, rendered in the cloud or on the user's own computer (asked every time), plus thumbnails, captions file and YouTube metadata."
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

**Owner's amendments (16 Nov 2026, Blob the Brilliant cast) - these override the lines above and sections 5 and 15
where they differ:**
- **Blob is the channel's fixed brand character** (`BLOB` in `Roles.ts`): white round face, black short hair on top,
  teal shirt `#1FA6A0`, thin line limbs, white round hands - identical in every video and every thumbnail. A video that
  needs one character uses Blob only. He wears a costume (`costume('prison' | 'astronaut' | 'chef' | 'winter' |
  'scientist' | 'worker' | 'detective' | 'athlete')`) only when the story needs one; his head, hair and face never
  change. Channel brand yellow: `#FFC83D`.
- **Supporting characters come from role templates** (`role(name, seed)` in `Roles.ts`, seed = the short's name):
  scientist, boss, guard, police, detective, athlete, friend, kid, worker. Each keeps its signature items; hair,
  colours and accessories change per video. When a story needs a role that isn't there, add a template that follows
  the same rules.
- **Never on a supporting character**: Blob's teal; the `bun` hairstyle (it reads as a brown circle / turban). Variety
  comes from caps, hats, headbands, glasses, sunglasses and held props (`hold`: gun, magnifier, clipboard, briefcase,
  coffee, phone, wrench).
- **Act with the library** (`Poses.ts`): named poses + expressions blended over time, limbs with elbows and knees
  (section 5).
- Smoking and guns can limit ads on YouTube: use the cigarette rarely and the gun only where the story needs it.

**Owner's amendments (16 Nov 2026, after studying a fast-growing cartoon Shorts channel) - these override every
"smooth camera only / no whips / no speed lines / no text in the scene" line in this file where they differ:**
- **Fast moves are allowed as accents** (`Moves.tsx`, section 6 "Fast moves"): a slam zoom into a face, a
  fly-through (the camera dives into an object, white flash, comes out in the next place), a smear / whip cut, a
  punch-in with overshoot - with **motion blur** (and speed lines on zooms) computed from the camera's real speed.
  At most one accent every ~5-8 s, each move <= 0.5 s, always landing on a word and settling into a smooth, sharp
  hold. Everything else stays the calm v3 camera. No hand-held shake, no roll, no random wobble - ever.
- **Pop-up cards are allowed in the scene** (`Cards.tsx`, section 8.1): a generic social post (`PostCard`), a
  newspaper front page (`Headline`), a big counting number (`BigNumber`). Invented names, handles and papers only;
  **no real logos or platform marks**; a card that quotes a real person quotes only something they really said
  (in the fact sheet, with its source); the words on a card match the narration at that moment. One card at a time,
  <= ~2.5 s, never covering the main face or the caption box. Explanation cutaways still carry no text.
- **Render speed rule**: these are 2D post effects - no extra 3D geometry, no second `World`. Sharp frames render at
  the old speed (measured: no change); only frames that are actually blurred cost more (measured ~1.6x per blurred
  frame at full size, i.e. about +2-4 % on a whole video with 4-6 accents). Cards cost nothing measurable.

**Owner's amendments (16 Nov 2026, after the chicken Short and studying the video it was inspired by) - VISUAL
STORYTELLING. These override every "calm / one smooth move per shot" line in this file where they differ. The owner's
words: the first cut "had the characters, chickens, trees, day and night - but it lacked the visual story". A picture
that only changes camera angle is not a new picture. Rules (apply to every video):**
- **Flash-forward hook (frame 0).** Open on the END of the story at its most striking: the winner on top of a mountain
  of what he earned, the disaster at its worst, the final state - with the losers / the contrast visible in the same
  frame (pull the camera back over the first 1-1.5 s to reveal them). On the first story word the picture rewinds (a
  flash transition, the pile blowing away, everything resetting) and the story starts from zero. This also makes the
  loop perfect: the last shot returns to exactly this frame.
- **An EVENT on every caption phrase, not just a cut.** Each phrase gets something that physically happens on its key
  word: coins fly up and vanish, houses sink into the ground, fields roll flat, a bowl empties down to bones, eggs pop,
  coops multiply, a line draws itself. Cuts and camera moves alone don't count. Write the event in the phrase table
  (section 3.4) in the column "what HAPPENS", separate from "camera".
- **One picture that explains the idea (the "why" shot).** Every video gets one cutaway that shows the core mechanism
  side by side, without text: a split stage (left = the ordinary way, right = the clever way), the same input on both
  sides, a different result. Chicken example: one hen = one egg a day, eaten, over and over (left) vs. one hen + rooster
  = a family tree of chickens growing generation by generation, with thin lines joining parents to children (right).
  Place it where the script states the difference; the camera whips from the left half to the right half on the word.
- **Big emotional props make the stakes physical.** A mountain of gold / eggs, a single coin or egg in a hand, an empty
  bowl with bones, a crowd of animals up to the knees, a lone door standing where a house was. Bigger than real is
  fine (cartoon exaggeration in what we see, never in the facts).
- **Colour carries the mood** (`Mood` in `Moves.tsx`): grey for the lost / poor / waiting days (`sat` 0.3, with a grey
  light preset), colour flooding back on the turn of the story (ramp `sat` 0.3 -> 1 on the key word), sepia for a
  flashback (`sat` 0.55, `sepia` 0.4), deep blue night with firelight, a warm golden sunset for the finale.
- **The camera keeps travelling.** Fly-overs of the place, a crane up as a crowd fills the frame, a sweep from the houses
  to the fields, a high diagonal aerial for "the whole world" (a vertical frame is narrow: line places up along a
  diagonal, never side by side). Fast accents are allowed more densely in the finale (slam - whip - slam within ~3 s).
- **The finale: split, compare, crown the winner.** (1) A high diagonal aerial where the world visibly divides (white
  lines draw themselves between the plots; each plot shows its fate: bare patch / modest hut / big farm). (2) Slam down
  to the loser holding his one small thing. (3) Whip to the middle one. (4) Slam to the winner, highlighted: the
  biggest prop, golden backlight, sparkles, arms raised - and the subscribe CTA plays over this shot, which glides back
  to frame 0 so the video loops.

**Owner's amendments (17 Nov 2026) - THE FIRST FRAME DECIDES THE SWIPE. These override every frame-0 / hook line in
this file where they differ (including "pull the camera back over the first 1-1.5 s to reveal" above). Viewers decide
in the first half second; a still, dark or busy first frame gets swiped. Rules (apply to every video):**
1. **Movement from frame one.** Blob is already in the middle of an action at frame 0 - running, ducking, pushing,
   pointing, flinching, grabbing - in a mid-motion pose (`Poses.ts`), never the rest / idle pose, never a slow walk-in
   from off screen. Something in the world moves too (the strange thing itself, debris, a prop flying). No still title
   card, no fade-in from black or white, no slow establishing push before the action, no logo sting. The camera may
   move from frame 0, but the subject is already fully in frame and acting.
2. **The strange thing is already happening in frame 0.** The premise is visible before a single word of explanation:
   for "What if the Eiffel Tower bent?" the tower is ALREADY bending in the first frame (mid-bend, rivets popping) with
   Blob reacting under it - not a straight tower that starts to bend at second 3. The flash-forward hook stays (frame 0
   = the end state / the event at its most striking), but it must be readable without any reveal move: no
   "wait for it" build-up, no zoom-out needed to understand it. The contrast / losers may slide in during the first
   second, they are a bonus, not the point.
3. **Hook text: 6-8 words, huge, readable at a glance.** One on-screen hook line (`HookText` in `Cards.tsx`) from
   frame 0 to about 2-2.5 s (or the first story word, whichever is first), then it pops out. 6-8 words, up to three lines,
   Inter 900, white with a thick dark stroke (or brand yellow `#FFC83D` on the key word), at least 110 px in design
   space (auto-shrinks only down to 96 px; if it doesn't fit at 96, cut words - never shrink further). Placed in the
   top zone (x 90-990, y 250-700 - clear of the search bar above and the like / share buttons, which start at y ~860) above the subject, never over Blob's face or the strange thing, never in the
   caption box. It names the strange thing in plain words ("EIFFEL TOWER IS BENDING RIGHT NOW", "ONE CHICKEN MADE THIS MAN
   VERY RICH"); no question-bait ("YOU WON'T BELIEVE..."), no "!" pile-ups, every word true. It is a separate line from
   the spoken hook (which stays 12-16 words, `references/script-formula.md`). The one-word captions play underneath
   as usual; no pop-up card is shown while the hook text is up.
4. **Bright, clear, one big subject.** Frame 0 is high-key daylight (a bright light preset, `Mood` `sat` 1, clear sky
   or a light set) - never night, grey mood, sepia, heavy fog or a dark interior, even if the story is grey later. One
   big subject fills 40-70 % of the frame (the strange thing with Blob, or Blob's reacting face with the strange thing
   behind him), centred above the caption box, against a simple uncluttered background with clear contrast. At most
   2-3 readable shapes; no crowd, no small props scattered around, no busy texture behind the subject. Because the
   video loops, the last frame returns to this bright frame: the golden finale's light ramps back to the frame-0
   preset during the CTA glide.
- **Check it** (section 10): `qa_video.py` prints a first-frame report (brightness, clutter, motion in the first
  0.2 s) and saves `qa/frame0_phone.png` at phone-feed size; look at it next to the thumbnails. Fix until all three
  read OK and the strange thing + hook text are readable at 216x384.

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
character, a 3D mug in a flat hand, real cast shadows). Copy its patterns, never its content.
Storytelling worked example: `shorts/chicken/` in the harry-shorts repo ("One chicken explains why the rich get
richer", 54.4 s): flash-forward hook on an egg mountain, coins flying away, grey hungry days, colour returning with
the chickens, the split "why" stage with a chicken family tree, multiplying coops, the three-way finale ending on Blob.
`examples/v3-moves/MoveTest.tsx` (5 s) shows the fast-move accents and pop-up cards: a slam zoom, a fly-through, a
smear cut, a post card, a counting number and a newspaper (`moves-sheet.jpg` = its contact sheet). `examples/water/` holds
only pipeline files from an older video (`story.json`, `timing.json`, `gen_sfx.py`, `youtube.md`) - use them for file
formats and the sound cue list, not for the look.

Read the whole file once before starting. Follow the order; each step says what "done" looks like. Never name or
recommend a specific image-generation or voice service in anything you write for the user (say "your voice tool").

Folder map (`<SKILL>` = this skill's base directory):
- `scripts/` - `new_project.sh` (makes a project), `gen_timing.py`, `align_take.py`, `sfxlib.py` (incl. `bed()` /
  `write_bed()`), `gen_sheet.py`, `make_captions.py`, `stills.mjs`, `sheet.py`, `thumbs.mjs`, `qa_video.py`,
  `retime.sh`, `master_audio.py`, `render_chunk.sh` + `join_chunks.sh` (2K in chunks), `bench.mjs` (real speed)
- `templates/remotion/` - package.json (pinned versions, incl. three + @react-three/fiber + @remotion/three),
  remotion.config.ts, tsconfig, `src/`: **`World3D.tsx`** = the 3D world (`World`, `Cel`, `cam3At`, `toScreen`,
  `celPoint`, `Box` / `Cyl` / `Ball` / `Ground`, `tex`, `Light`, `Cuts`, `Dissolve`), **`Cast.tsx`** = the flat
  `Person`, `Captions.tsx` = one-word safe-area captions + `SafeGuides`, `Cta.tsx` = `Cta` subscribe button,
  `ThumbText`, `Tag`, **`Moves.tsx`** = fast-move accents (`EASE`, `camBlur`, `MotionBlur`, `ShotBlur`, `Transition`,
  `SpeedLines`) and `Mood` (grey / sepia colour moods), **`Cards.tsx`** = pop-up cards (`PostCard`, `Headline`, `BigNumber`, `cardIn`, `flyX`),
  **`ThumbKit.tsx`** = `ThumbFrame`, `POP`, `Ring`, `Arrow` (section 12), `Bits.tsx` = `Puff` / `Pill` / `Bracket` / `Sparkle` (flat screen-space effects), `Layer.tsx` =
  outline scale, `math.ts`, `color.ts`, `Root.tsx`
- **Cast library - Appendix A at the end of this file**: the current `Cast.tsx` (elbows + knees, outfit pieces, held
  props), `Poses.ts` (24 named poses, 18 expressions, blending, walk / run) and `Roles.ts` (Blob, his costumes, 9 role
  templates). They supersede the template's `Cast.tsx`; section 2 says when to write them.
- `examples/v3-demo/` - `Short.tsx`, `timing.json`; `examples/water/` - pipeline file formats only
- `examples/thumbnails/` - `reference-feed.jpg` (the owner's thumbnail reference - read it before section 12) and
  `chaseout-thumbs.jpg` (a worked example)
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

**Then ask where to render, every time** (a third question, never assumed; owner's rule 17 Nov 2026 - cloud renders
take too long): "Where should the video be rendered?"
1. **My computer (local)** - "Render on my own hardware." Claude does everything up to the render in the cloud
   (script, animation, contact-sheet stills, re-timing, sound, thumbnails, metadata), pushes the project, and the user
   runs ONE command on their computer (section 11, "Local render"). Usually much faster (their GPU and all CPU cores).
2. **Cloud** - "Render here in the cloud." Claude renders everything (slow: ~1-3 s per 2K frame, a 50 s Short takes
   1.5-3 hours, in chunks).
Remember the answer as `RENDER_AT` for the whole job. Ask all three questions in one AskUserQuestion call when
possible. The user can switch later ("render it in the cloud after all") - then follow the other route.

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
- **Structure: read `references/script-formula.md` before writing.** It gives the beat skeleton (hook, setting,
  escalation, mystery, pivot + analogy, payoff / callback ending, subscribe line) and how many words each beat gets
  at the length the user chose (30 / 45 / 55 / 60 / 90 s, and a rule for any other length).
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
only - the same fact sheet for all five, no new claims) and has a different first line. Every variant uses the beat
skeleton and word budget of `references/script-formula.md` (section 5 there maps each angle to its hook pattern).
Show for each: the angle, its hook line, the full script with beat labels and words per beat, word count + estimated length, and one line on how it would look (cast, shots, the
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
**Then write the cast library (every project):** copy the three files in Appendix A verbatim into `src/` -
`src/Cast.tsx` (replaces the template's), `src/Poses.ts`, `src/Roles.ts` - and run `npx tsc -p .`. Every character in
the video is built from them (Blob from `BLOB` / `costume()`, everyone else from `role()`).
Cloud sandbox notes: Remotion uses the pre-installed headless Chromium when present (config auto-detects). The 3D
world needs WebGL: with no GPU only the software renderer works (`swangle`, the default in `remotion.config.ts`,
`stills.mjs` and `thumbs.mjs`; set env `GL=angle` on a machine with a GPU). Measured on 4 cores without a GPU: a simple
set ~0.2 s per half-size frame; the chicken Short's rich village ~0.35-0.7 s per half-size frame and ~1.8-3.3 s per 2K
frame (a 54 s Short = ~3 h at 2K). **More tabs don't help**: SwiftShader already uses every core (conc 1 / 2 / 4 measured
0.31 / 0.32 / 0.34 s per frame) - use `--concurrency=2`. Measure with `tools/bench.mjs` (a real 40-frame render), never
with stills (each still reloads the page and re-uploads every texture: ~7x too slow). Run renders in the background; Hugging Face is usually blocked, so word times come from
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
   Columns: phrase -> what HAPPENS (the physical event on the key word, 16 Nov storytelling amendment) -> camera ->
   size -> mood colour -> sound. A row whose only change is the camera angle is not finished.
   **The hook shows the consequence**: frame 0 is the flash-forward (the end state at its most striking, the contrast
   in the same frame), then the story rewinds into the explanation on the first story word. The first row of the
   table is the **frame-0 row** (17 Nov amendment): what Blob is already doing (mid-action pose), the strange thing
   already happening, the 6-8 word hook text, the bright light preset, and the one big subject - all from frame 0,
   nothing that builds up.
   **Clean cuts** between pictures (cut on the word); one smooth camera move inside each; at most 1-2 short
   dissolves. Mark 4-6 **accent beats** in the table (the hook, a reveal, a place change, the payoff): each gets one
   fast move from `Moves.tsx` (slam zoom, fly-through, smear cut, punch-in, flash cut). Never shake. A video has 1-3
   places, each with its own palette.
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
  optional flat extras (hats incl. fedora / police / helmet, glasses or sunglasses, moustache, scarf, headband,
  cigarette, lab coat / suit / trench coat, tie, apron, badge, belt, a held prop - see `Outfit` in `Cast.tsx`; no `bun`
  on anyone); a small narrow flat-colour torso (`shirt`, optional `vest`, `buttons`); extremely thin black line arms and legs; small flat white rounded hands; minimal black feet. Feet at
  (0,0), about 430 units tall.
- **Never on a character**: gradients, highlights, crescent shades, textures, blur, drop shadows, 3D
  transforms, perspective skew, visible thickness.
- **Face colour follows the situation** (`tint` = any flat colour, `tintAmt` 0..1, `steam` 0..1): white at rest;
  green = poisoned / sick, red + steam = burning / hot / furious, pale blue = freezing / terrified, yellow-green =
  queasy, purple = out of breath. Ramp over 0.3-0.4 s on the word, hold, ramp back when it passes. `spots` adds flat
  red dots (rash, blisters, stings). Clothes may be a flat pattern (dots, flowers, stripes) - flat shapes only. A character is the same flat drawing in a wide and in a close-up.
- **Outline**: every stroke is `px / useK()` (9 px body outline, thinner limbs); `<Cel>` sets `k`, so the outline keeps
  one consistent on-screen weight across shots and only thins when a character is small in a wide.
- **The cast** (1-3 people): Blob (`BLOB`, fixed) plus supporting roles from `role(name, shortName)` (`Roles.ts`, 16 Nov
  amendment). Define each outfit once as a constant and reuse it in every shot; scale each role by its `size` (kid 0.72,
  boss 1.05) on `<Cel h>`. Supporting looks change with every video; Blob never does.
- **Turns are redrawn poses**: `view="front" | "left" | "right" | "back"` (the face slides, the far eye narrows, feet
  and cap peak point that way; `back` hides the face). Switch view on a step change (`pick`), never by scaling x
  through zero, never by a 3D rotation. `faceDx/faceDy` and `lookX/lookY` give small looks within a view.
- **Acting** (the only ways a character moves): joint rotations = moving `handL/handR/footL/footR` (the line limbs
  follow), `bounce` (small body lift, feet stay), `lean`, deliberate `headTilt`, and clear changes of `brow` / `browUp`,
  `eyes` (`dot`, `wide`, `squeeze`, `closed`), `mouth` (`smile`, `flat`, `frown`, `o`, `open`, `grin`, `teeth`, `wavy`,
  `smirk`), `blink`, `sweat`. Change expression on the word, hold it, blink on holds. Anticipation before a gesture and
  a small settle after (`spring`). No mouth flapping to the narration: the mouth is an expression, not speech.
- **Pose + expression library** (`Poses.ts`) - use it instead of hand-placing hands and feet:
  body poses `POSES`: stand, relaxed, wave, point, pointUp, explain, shrug, facepalm, handsOnHead, think, crossArms,
  holdFront, reach, cheer, sad, scared, crouch, sit, sitThink, kneel, kick, jump, fall, run (side poses face right;
  `mirrorPose` flips them); faces `EXPR`: neutral, happy, joy, shocked, scared, angry, furious, sad, sick, smug,
  confused, thinking, nervous, sleepy, determined, freezing, awe, grin (each sets eyes, brows, mouth, look and face
  colour together).
  `<Person id="blob" outfit={BLOB} t={t} {...breathe(act(t, [[0, 'stand'], [K.word - 0.3, 'shrug']], [[0, 'happy'], [K.word - 0.3, 'confused']]), t)} />`
  `act` = body + face keyed on word times, each change blended over 0.3 s (`blendPose` interpolates points and joints
  and fades face colour; view / eyes / mouth switch at the midpoint); `breathe` adds whole-cycle idle life (loops stay
  clean). Override any value by spreading after it (`{...act(...), handR: [120, -300]}`).
- **Joints**: arms and legs have elbows and knees (two straight segments, 48 + 48 / 52 + 52 units). They hang straight
  at rest and bend only when a hand or foot comes closer; elbows bend outward, knees toward the facing side. Set
  `elbowL/R`, `kneeL/R` to place a joint exactly (sitting, kneeling). `joints: false` restores the old curved limbs.
- **Walking / running**: `walk(phase, {run, view})` from `Poses.ts` while the `<Cel at>` moves along the ground. Drive the
  phase from distance so feet plant instead of sliding: `phase = 2 * PI * distance / (4 * stride * scale)` (stride 50
  walking, 58 running, in character units). When the character stops, blend out of the cycle into the next pose over
  0.3 s.
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
  wobble, no roll. Keys sit on word keys (`K.word - 0.4`); the last camera equals the first (loop). The exception is
  the fast-move accents below.
- **Fast moves** (`Moves.tsx`, the 16 Nov amendment): a key may carry its own ease as a third element -
  `[K.word, {pos, look, fov}, EASE.slam]` - which shapes the move INTO that key: `EASE.slam` (full speed, hard brake:
  the rush from a wide into a face, 0.3-0.45 s), `EASE.punch` (slam with a small overshoot: a push-in on a key word),
  `EASE.dive` (accelerates into the key: flying INTO an object right before a fly-through cut), `EASE.whip` (all the
  motion in the middle: a fast pan / track between two held framings). Wrap each shot's `World` in
  `<ShotBlur t={t} cam={KEYS}>` (the same key list the shot passes to `cam3At`): it measures how fast the picture
  moves and adds motion blur (directional for pans, a soft blur + slight stretch + speed lines for zooms) ONLY above
  ~14 px per frame, so normal glides stay sharp and cost nothing. An orbit around the subject keeps the subject
  sharp (turning and sliding cancel). Never put captions, the CTA or a card that must be read inside the blur.
- **Editing**: `<Cuts t shots={[[0, <A/>], [K.x, <B/>], ...]}>` = clean cuts on actions and reveals;
  `<Dissolve t at a b>` = a 0.25-0.4 s dissolve, 1-2 per video at most;
  `<Transition t at kind a b>` (`Moves.tsx`) = a fast transition that renders only one shot at a time (free):
  `'fly'` (push + zoom blur + white flash: pair with an `EASE.dive` camera into an object in shot a), `'smear'` (a
  whip into horizontal blur, the next shot arrives from the other side; `dir` = -1 / 1), `'flash'` (a clean cut under a
  quick white or coloured flash: big reveals and impacts). 0.35-0.45 s, on the word. Use 2-4 per video, not every cut.
- **Render cost (measured on the chicken Short)**: software WebGL pays per separate TEXTURED mesh (~5 ms each per
  frame), not per triangle and hardly per pixel (0.5x and 1x size differ by ~12 %). Put every repeated thing into one
  `Instances` (World3D.tsx) - coins, eggs, clouds, tree crowns, fruit, hills, pebbles, leaves - place static instances
  once (useMemo) and only update what moves; small cels (< 0.8 m: animals) get only a contact blob. Sphere tessellation
  doesn't matter. A rich village with a flock of 32 birds: ~0.35 s per half-size frame, ~1.8-3.3 s per 2K frame.
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

8.1 **In the scene, no stray writing.** No floating labels, speech bubbles, logos or watermarks; show numbers with
    things first (a row of copies, a gauge needle, a pile that grows, a ruler prop, a character counting on raised
    hands). **Pop-up cards** (`Cards.tsx`, 16 Nov amendment) are the allowed exception, on the beat where the voice
    says the words:
    - `PostCard` (name, handle, text, avatar colour + initial, optional likes / verified tick) - a generic post, no
      platform logo; for "people online said...", "he posted...", "the company announced...";
    - `Headline` (invented masthead `paper`, `title`) - a newspaper page that pops or tumbles in; for "the news called
      it...", "headlines everywhere...";
    - `BigNumber` (`text`, or `to` + `count` 0..1 to count up, optional `sub`) - for the one striking number of the
      video, exactly as spoken.
    - `HookText` (`t`, `text`, `tOut`, `keys`) - the 6-8 word hook line on frame 0 only (17 Nov amendment): full size
      from the very first frame, pops out at ~2-2.5 s; nothing else pops up while it is on screen.
    Place them with `cardIn(t, tIn, tOut)` (pop + tilt spring, pop out) or `flyX` (fly in from a side), as children of
    `<World>` (its SVG layer) or anchored to a 3D object with `toScreen`. Rules: invented names only, never a real
    logo, platform mark or real account presented as a real post; a real person's words only if they really said them
    (sourced); one card at a time, <= ~2.5 s; inside x 140-900, y 250-1100, never over the main face or the caption
    box; a character reacts to the card (looks at it, face changes). Pop a card out before a fast move or keep it in
    a full-frame overlay outside `ShotBlur` so it is never smeared. A `Pill` stays the fallback for a short label.
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
- **Preview** (`RENDER_AT` = local: skip the cloud preview MP4 - check with contact sheets only, and push so the user
  can run `node tools/render_local.mjs --preview` if they want to see motion; ask them to upload `out/preview.mp4` if
  you need `qa_video.py` on it): render 0.5x (`npx remotion render src/index.ts Short out/preview.mp4 --scale=0.5 --crf=20 --concurrency=4`), then
  `python3 tools/qa_video.py out/preview.mp4`:
  - pop scan (caption + tag bands masked): every flag must be an intended cut, pop-in, fast move / transition accent or
    fast action - list them against the beat table; an unexplained isolated spike is a bug; accents: 4-6 per video,
    each <= 0.5 s, each settling into a sharp hold (check a still 0.2 s after every accent);
  - loop: first vs last frame mean abs diff < 0.5 on the preview (< 0.2 at full size). Things that break loops: a drifting
    3D cloud, swaying foliage or breathing that doesn't complete whole cycles over the duration, a state that isn't reset;
  - loudness and audio silences (v2: no silences expected - the bed is continuous; loudness about -14 LUFS after
    mastering);
  - first frame (17 Nov amendment): brightness, clutter and early-motion all OK in the report; open
    `qa/frame0_phone.png` and confirm Blob is mid-action, the strange thing is visible and the hook text reads;
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
Render in the background and wait for it. A cloud background job stops after 2 h, so for anything over ~1500 frames
run `RENDER=0 tools/retime.sh take.mp3`, then render 2K in chunks of ~1100 frames, ONE JOB AFTER THE OTHER:
`tools/render_chunk.sh 0 1099`, `tools/render_chunk.sh 1100 2199`, ... (silent, `out/chunk_<first>.mp4`; check each
chunk's frame count), then `tools/join_chunks.sh` joins them, mixes voice + sfx + bed exactly as `Short.tsx` does and
masters to -14 LUFS. If a tab times out creating its 3D canvas, lower `CONC`.
**Local render (`RENDER_AT` = local).** Run `RENDER=0 tools/retime.sh take.mp3` (everything except the render), check
the stills, then commit the WHOLE short folder - `src/`, `public/<short>/vo.wav` + `sfx.wav` + `bed.wav`,
`src/timing.json`, `story.json`, `tools/` (`out/` and `node_modules/` are not needed) - and push the branch. Then give
the user exactly these steps (each command in its own code block), with the branch name and folder filled in:
1. One-time setup: install Node 18+ (nodejs.org) and git; clone the repo, or `git pull` if they already have it.
2. `git fetch origin <branch>` then `git checkout <branch>` (or `git pull` when already on it).
3. `cd shorts/<short>` then `node tools/render_local.mjs` - the first run installs packages (~1 min, plus the
   Chrome download Remotion needs). Output: `out/<short>-2K.mp4`, 1440x2560, 60 fps, audio mastered to -14 LUFS; it
   prints seconds per frame and the frame count check.
   Options: `--preview` (half size, fast), `--frames=0-299` (time a short part first), env `CONC=<n>` (parallel frames,
   default half the CPU threads; lower it if the computer runs out of memory or a 3D canvas times out), `GL=angle`
   (GPU, the default on Windows / macOS) or `GL=swangle` (CPU fallback if the picture is black or the GPU fails).
   On Windows PowerShell, set env as `$env:CONC=4; node tools/render_local.mjs`.
   **Easiest on Windows (tell non-technical users this first):** no Git, no typing - download the branch as a ZIP
   from GitHub (branch page -> green Code button -> Download ZIP), unzip it, open `shorts/<short>/` and double-click
   `render.bat` (it checks Node.js, then offers 1 = 5 s test in 2K, 2 = 5 s preview, 3 = full 2K, 4 = full preview,
   and opens the `out` folder when done).
4. Watch it once with sound, then upload the MP4 back (or commit it to `out/` and push) so Claude runs `qa_video.py`
   and the verify list below on it.
If the session can reach a folder on the user's own computer (`list_computer_folders` shows it online), offer to run
the same command there directly (`request_computer_folder`, then Bash with `_host`) instead of the hand-off. If a local
render fails, read the error they paste: missing `vo.wav` = the files were not pushed; "Timed out ... canvas" = lower
`CONC`; a black 3D picture = `GL=swangle`. Do not switch to a cloud render unless the user asks.

**Verify the file**: 1440x2560, 60 fps, frame count = duration x 60, audio present and as long as the picture, `qa_video.py`
on the final: flags all intended, loop diff < 0.2, loudness about -14 LUFS (mastered), true peak below -1 dBTP, no audio silences (continuous bed). Say sync was verified by measurement and stills, not by ear.

---------------------------------------------------------------------------------------------------------------------
## 12. Thumbnails (three variants) - engaging, a little click-baity, always true

**Reference (look at it every time before making thumbnails): `examples/thumbnails/reference-feed.jpg`** - the owner's
favourite Shorts feed (cartoon channel, crore-view videos). What makes those tiles irresistible, and what ours must copy:
- **ONE huge expressive face** fills 40-70 % of the tile: shock ("o" mouth, wide eyes, raised brows), smugness (closed
  eyes, smirk), panic (sweat drop, "teeth" grimace), or a face colour (pale blue, green, red with steam). Never a wide
  shot with small figures - at feed size (216x384) small faces disappear.
- **A mystery or a promise**, not a summary: something is wrong, missing, about to happen, or absurd, and only the video
  answers it (an empty chair circled in red, a hand reaching for the wrong thing, a smug character doing nothing).
- **Saturated, high-contrast colour** (`POP` filter on the scene only), a clear light/dark split between the face and the
  background, one bright accent prop.
- **Few words**: 2-3 words, at most 5, white line + yellow line; often a question ("WHERE DID HE GO?") or a bold claim
  ("PAID TO DO NOTHING"). Many reference tiles work with almost no text, so the picture must read on its own.
- **One pointer at most**: a red ring + red arrow (`Ring`, `Arrow`) on the mystery object, placed with `toScreen` so it
  sits exactly on the 3D object.

Rules that do not change: every word and picture must be true for the video (a teaser, never a lie - no events, numbers
or outcomes the video doesn't show); same look as the video (flat cast in the 3D set, re-staged with a punchier camera,
not a different style); keep honesty tags ("not to scale") when they apply.

How to build them:
- `Thumb` composition (`variant` A/B/C). Use `ThumbKit.tsx` (`ThumbFrame`, `POP`, `Ring`, `Arrow`). Each variant is its
  OWN staged `World` (not just a frame of a shot): camera 2-3 m from the hero face, fov 36-42, the face big in the
  lower-middle (y 500-1300), the mystery object visible beside it, text at top 190 (safe zone x 90-990, y ~285-1635,
  never over the main face). `SCALE=2 node tools/thumbs.mjs A B C`, then 1080x1920 JPGs (quality 93) with PIL.
- Three concepts every time: (A) **the mystery** - the hero's biggest reaction face + the circled thing that causes it
  + a question; (B) **the absurd / smug character** close-up + a bold short claim; (C) **the antagonist or the stakes**
  - the villain/boss/danger huge in the foreground with the hero small and worried behind + the topic's name.
- Check all three on one sheet at phone-feed size (216x384) next to the reference: the face and the hook must read at
  that size. Recommend one (usually A: big emotional face + unanswered question) and say it is design judgment, not click
  data; suggest testing A vs B.
- Worked example: `examples/thumbnails/chaseout-thumbs.jpg` ("WHERE DID HE GO?" / "PAID TO DO NOTHING" / "JAPAN'S
  BANISHMENT ROOM") and its `Thumb` code in `shorts/chaseout/src/Short.tsx` of the harry-shorts repo.

---------------------------------------------------------------------------------------------------------------------
## 13. YouTube title, description, tags (every video)

Follow `references/youtube-metadata.md` (example: `examples/water/youtube.md`): a 40-60 character title + 2 alternates,
a description (hook line, 2-3 plain sentences with the key facts, honesty line about scale if needed, sources with URLs,
the subscribe line, 3 hashtags incl. #Shorts), 10-15 tags under 500 characters. Everything must match the video's facts;
no bait, no other creators' names. Save as `youtube.md`.

---------------------------------------------------------------------------------------------------------------------
## 14. Hand-off and honesty

With `RENDER_AT` = local, the video is delivered by the user's own render (section 11); hand off everything else as
below and run the checks on the MP4 they send back. Deliver (send the files; put them in the user's working folder): `out/<short>-2K.mp4`, `voiceover/captions.srt`,
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
- Blob identical in every video (teal shirt; a costume only when the story needs it); supporting roles from the
  templates with a new look per video; new place and palette for every video; identical cast and set within a video.
  No bun on anyone, and never Blob's teal on anyone else.
- Smooth camera in every shot (track, dolly, gentle push-in, high-angle insert, reaction close-up); clean cuts on
  actions and reveals; at most 1-2 short dissolves; 4-6 fast-move accents per video (slam zoom, fly-through, smear,
  punch-in, flash) with motion blur from `Moves.tsx`, each <= 0.5 s and settling sharp; never shake or roll.
- Scenes carry no dialogue, lip-sync, speech bubbles, logos, watermarks or unnecessary labels; honesty tags stay;
  pop-up cards (`PostCard`, `Headline`, `BigNumber`) only on the beat the voice says it, invented names, no real logos.
- Frame 0 = the premise, centred, big, readable; the first spoken line names what you see.
- First frame (17 Nov): Blob already mid-action, the strange thing already happening, a 6-8 word hook text (>= 96 px,
  top zone), bright high-key light, one big subject on a simple background; no title card, fade-in or build-up.
- Feet planted, hands reach props before they move, one focal action at a time.
- One-word captions in the safe box; the sound never drops out; every visual on its word; the payoff on the last
  explanation word; the CTA follows; the last frame loops to the first.
- One picture per caption phrase; one layer deep on every fact; no text in cutaways; the hook shows the consequence.
- Visual storytelling (16 Nov): flash-forward hook on frame 0; an EVENT on every phrase; one side-by-side "why" shot;
  big emotional props; mood colour (grey / colour returns / sepia / golden finale); a travelling camera; the finale
  splits the world and crowns the winner, then loops to frame 0.
- The length is whatever the user answered in section 0, and the render happens where they answered (`RENDER_AT`).
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
Pitfalls met on the chase-out room Short (Nov 2026): a cast head is 0.8 m across, so a camera 3-4 m away fills the
frame with one face - stage at most two main characters per shot, at least 1.2 m apart, camera 5-9 m back for
two-shots (remove the wall behind the camera: a front-cutaway set), and never seat background extras where their heads
land behind a main face; a camera looking +z mirrors left/right (screen right = -x), so set `view` and `front` wall
pieces by screen side, not by world side; every beat needs the hero in the picture (empty object inserts read as random
furniture) and a repeated framing for before/after payoffs; when a take has a long pause inside a sentence the aligner
can slip a sentence - pass `BOUNDS` from `silencedetect`; a cloud background job stops at its time limit, so render 2K in
~1050-frame chunks (`--frames`, `--muted`) and join them with the mixed audio (concat + mix + `master_audio.py`).
Pitfalls met building the fast-move kit (16 Nov 2026): any CSS / SVG filter over the WebGL canvas forces a copy of the
3D frame out of the GPU layer - that copy, not the blur size, is the cost (an identity filter cost almost as much as
a 30 px blur; rendering the blur at 1/4 resolution saved nothing), so `MotionBlur` renders NO filter element at all
below its threshold; a first version blurred normal glides (4-8 px/frame) and made a whole test render 2x slower;
the screen-speed formula must let turning and sliding cancel on an orbit, or every orbit shot blurs.
Pitfalls met on the chicken Short (16 Nov 2026): one picture per phrase is not enough if the pictures are a
character standing still from a new angle - give every phrase an event (storytelling amendment); a vertical frame
can't show three plots side by side (5-6 m wide at 15 m) - stage them along a diagonal for the aerial; a flock drawn in
front of the hero covers his face from a high camera - keep a bird-free lane in front of and behind him; every
animation that must loop (pecking, sparkles, breathing) uses whole cycles over the video (`loopS`), never sin(t * k);
`new_project.sh`'s template already contains the cast library; render 2K in chunks (one 2-hour job is not enough for
a rich 50 s Short); `ffmpeg -shortest` while muxing the mixed audio dropped the last 2 frames (removed from
`join_chunks.sh`); `retime.sh` fails if the take path is already `voiceover/take/take.mp3` (cp onto itself) - pass a
copy from elsewhere; `shimmer()` in sfxlib needs >= 0.85 s and crackle-style loops need a margin larger than the
sound they paste.
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

---------------------------------------------------------------------------------------------------------------------
## Appendix A. Cast library (write these three files into `src/` in every project, verbatim)

### `src/Cast.tsx`
````tsx
import React from 'react';
import {useK} from './Layer';
import {INK, mix} from './color';
import {Puff} from './Bits';

/** v3 cast member: a STRICTLY FLAT 2D cel. Solid white circular face, thick consistent dark outline, flat black oval
 *  eyes, separate graphic eyebrows, a simple drawn mouth, flat solid-colour hair and clothes, a small narrow torso,
 *  extremely thin black line arms and legs, small flat rounded hands, minimal feet.
 *  NO gradients, highlights, shading, textures or thickness here - ever. Shadows come from the 3D world.
 *  The face is white at rest and takes ONE flat colour when the situation calls for it (`tint`, `tintAmt`): green =
 *  poisoned, red + `steam` = burning / furious, pale blue = freezing / scared. Ramp it in and out; never a gradient.
 *  Feet at (0,0); head centre (0,-330), r 100; about 430 units tall. Strokes are px / k (constant screen weight).
 *  Turns are REDRAWN poses (`view`), never a rotated solid: front, left, right, back. */
export type Outfit = {
  shirt?: string; vest?: string; hat?: 'cap' | 'bowler' | 'top' | 'hardhat' | 'beanie' | 'fedora' | 'police' | 'helmet' | 'none'; hatColor?: string;
  hair?: string; hairStyle?: 'short' | 'sides' | 'long' | 'bun' | 'ponytail'; mustache?: boolean; glasses?: boolean; scarf?: string; buttons?: boolean;
  coat?: string; coatStyle?: 'lab' | 'suit' | 'trench';   // long open lab coat, suit jacket with a white V, or a belted trench coat
  headband?: string;                                     // sports headband with two ribbon tails
  sunglasses?: boolean; glassesColor?: string; cigarette?: boolean;
  hold?: 'gun' | 'magnifier' | 'clipboard' | 'briefcase' | 'coffee' | 'phone' | 'wrench';   // prop held in the right hand
  tie?: string; apron?: string; badge?: string; belt?: string;   // flat extras: tie, front apron, small star badge on the chest, waist belt
};
export type PersonPose = {
  id: string; outfit?: Outfit; view?: 'front' | 'left' | 'right' | 'back';
  lean?: number; sx?: number; sy?: number; bounce?: number;                 // lean = whole-body tilt (deg); bounce = lift of the body (units), feet stay
  headTilt?: number; faceDx?: number; faceDy?: number;                      // head tilt (deg) about the neck; face slides on the head = look direction
  lookX?: number; lookY?: number; blink?: number; brow?: number; browUp?: number;   // brow: + = inner end down (angry), - = inner end up (worried)
  eyes?: 'dot' | 'wide' | 'squeeze' | 'closed'; mouth?: 'smile' | 'flat' | 'o' | 'open' | 'grin' | 'teeth' | 'wavy' | 'smirk' | 'frown';
  handL?: [number, number]; handR?: [number, number]; footL?: [number, number]; footR?: [number, number];
  sweat?: number; handsBack?: boolean;
  elbowL?: [number, number]; elbowR?: [number, number]; kneeL?: [number, number]; kneeR?: [number, number];   // optional explicit joints (else auto-bent)
  joints?: boolean;                                                         // false = the old single-curve limbs
  tint?: string; tintAmt?: number; steam?: number; t?: number;              // flat face colour for the situation (hex), 0..1; steam puffs 0..1 (pass t for their motion)
  spots?: number;                                                           // 0..1 flat red spots popping out on the face one by one (rash, blisters, stings)
};

/** Two-segment limbs. Upper arm + forearm 48 + 48, thigh + shin 52 + 52 (limbs hang straight at rest, bend only when a hand or foot comes closer) (units). A joint the pose doesn't set is solved:
 *  elbows bend outward (away from the body), knees bend toward where the character faces (outward in a front view). */
export const ARM = 48, LEG = 52;
const ik = (a: [number, number], b: [number, number], L: number, pickBetter: (q: [number, number]) => number): [number, number] => {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.max(1e-3, Math.min(Math.hypot(dx, dy), 2 * L - 0.01));
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, d / (2 * L))));
  const c1: [number, number] = [a[0] + Math.cos(base + off) * L, a[1] + Math.sin(base + off) * L];
  const c2: [number, number] = [a[0] + Math.cos(base - off) * L, a[1] + Math.sin(base - off) * L];
  return pickBetter(c1) >= pickBetter(c2) ? c1 : c2;
};
export const jointsFor = (p: Partial<PersonPose>) => {
  const bounce = p.bounce ?? 0, dir = p.view === 'left' ? -1 : p.view === 'right' ? 1 : 0;
  const hL = p.handL ?? [-78, -120], hR = p.handR ?? [78, -120], fL = p.footL ?? [-30, -5], fR = p.footR ?? [30, -5];
  const kneePick = (side: number) => (q: [number, number]) => (dir ? q[0] * dir : q[0] * side) - q[1] * 0.01;
  return {
    elbowL: p.elbowL ?? ik([-34, -204 - bounce], hL, ARM, (q) => -q[0] + q[1] * 0.15),
    elbowR: p.elbowR ?? ik([34, -204 - bounce], hR, ARM, (q) => q[0] + q[1] * 0.15),
    kneeL: p.kneeL ?? ik([-18, -112 - bounce], [fL[0], fL[1] - 4], LEG, kneePick(-1)),
    kneeR: p.kneeR ?? ik([18, -112 - bounce], [fR[0], fR[1] - 4], LEG, kneePick(1)),
  };
};
const HY = -330, HR = 100;
const SPOTS: [number, number, number][] = [[-64, -54, 11], [60, -60, 9], [-72, 20, 9], [68, 24, 12], [-46, 62, 8], [50, 64, 10], [2, -76, 9]];
const TORSO = 'M -40 -118 C -52 -166 -44 -226 0 -230 C 44 -226 52 -166 40 -118 Q 0 -104 -40 -118 Z';
export const Person: React.FC<PersonPose> = (p) => {
  const k = useK(); const ow = 9 / k;
  const {id, outfit = {}, view = 'front', lean = 0, sx = 1, sy = 1, bounce = 0, headTilt = 0, faceDx = 0, faceDy = 0, lookX = 0, lookY = 0, blink = 0, brow = 0, browUp = 0,
    eyes = 'dot', mouth = 'smile', handL = [-78, -120], handR = [78, -120], footL = [-30, -5], footR = [30, -5], sweat = 0, handsBack = false, spots = 0, tint, tintAmt = 0, steam = 0, t = 0, joints = true} = p;
  const J = jointsFor(p);
  const face = tint ? mix('#FFFFFF', tint, tintAmt) : '#FFFFFF';
  const o = {shirt: '#3F7FD9', vest: undefined as string | undefined, hat: 'none' as Outfit['hat'], hatColor: '#3A3A3E', hair: undefined as string | undefined, hairStyle: 'short' as Outfit['hairStyle'], ...outfit};
  const dir = view === 'left' ? -1 : view === 'right' ? 1 : 0, back = view === 'back';
  const fx = faceDx + dir * 40, fy = HY + faceDy;
  const limb = ow * 0.72;                                                    // extremely thin line limbs
  const arm = (s: [number, number], h: [number, number], side: number) => `M ${s[0]} ${s[1] - bounce} Q ${(s[0] + h[0]) / 2 + side * 20} ${(s[1] - bounce + h[1]) / 2 + 12} ${h[0]} ${h[1]}`;
  const eye = (sgn: number) => {
    const far = dir !== 0 && sgn === dir;                                    // in a side view the eye nearer the edge is drawn narrower
    const ex = fx + sgn * (dir ? 27 : 34) + lookX, ey = fy - 10 + lookY, w = far ? 0.68 : 1;
    if (eyes === 'squeeze') return <path key={'sq' + sgn} d={`M ${ex - sgn * 13} ${ey - 12} L ${ex + sgn * 9} ${ey} L ${ex - sgn * 13} ${ey + 12}`} stroke={INK} strokeWidth={ow * 0.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (eyes === 'closed') return <path key={'cl' + sgn} d={`M ${ex - 14 * w} ${ey - 2} Q ${ex} ${ey + 8} ${ex + 14 * w} ${ey - 2}`} stroke={INK} strokeWidth={ow} fill="none" strokeLinecap="round" />;
    if (eyes === 'wide') return <ellipse key={'wide' + sgn} cx={ex} cy={ey} rx={13.5 * w} ry={20 * (1 - 0.85 * blink)} fill={INK} />;
    return <ellipse key={'dot' + sgn} cx={ex} cy={ey} rx={10.5 * w} ry={15 * (1 - 0.85 * blink)} fill={INK} />;
  };
  const browD = (sgn: number) => {
    const bx = fx + sgn * (dir ? 29 : 36), by = fy - 50 - browUp * 14, a = brow * 0.38 * sgn, dx = Math.cos(a) * 20, dy = Math.sin(a) * 20;
    return <path key={sgn} d={`M ${bx - dx * sgn} ${by + dy} Q ${bx} ${by - 6} ${bx + dx * sgn} ${by - dy}`} stroke={INK} strokeWidth={ow * 1.15} fill="none" strokeLinecap="round" />;
  };
  const mx = fx + dir * 6, my = fy + 40;
  const line = (d: string, w = 0.85) => <path d={d} stroke={INK} strokeWidth={ow * w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  let m: React.ReactNode = null;
  if (mouth === 'smile') m = line(`M ${mx - 22} ${my - 4} Q ${mx} ${my + 15} ${mx + 22} ${my - 4}`);
  else if (mouth === 'frown') m = line(`M ${mx - 20} ${my + 10} Q ${mx} ${my - 8} ${mx + 20} ${my + 10}`);
  else if (mouth === 'flat') m = line(`M ${mx - 17} ${my + 2} L ${mx + 17} ${my + 2}`);
  else if (mouth === 'wavy') m = line(`M ${mx - 22} ${my + 4} q 7 -8 14 0 t 15 0 t 15 0`, 0.8);
  else if (mouth === 'smirk') m = line(`M ${mx - 20} ${my + 4} Q ${mx + 4} ${my + 14} ${mx + 24} ${my - 8}`, 0.9);
  else if (mouth === 'o') m = <ellipse cx={mx} cy={my + 6} rx={12} ry={16} fill={INK} />;
  else if (mouth === 'teeth') m = (<g><rect x={mx - 30} y={my - 8} width={60} height={28} rx={10} fill="white" stroke={INK} strokeWidth={ow * 0.85} />
    {[-15, 0, 15].map((d) => <path key={d} d={`M ${mx + d} ${my - 8} L ${mx + d} ${my + 20}`} stroke={INK} strokeWidth={ow * 0.5} />)}
    <path d={`M ${mx - 30} ${my + 6} L ${mx + 30} ${my + 6}`} stroke={INK} strokeWidth={ow * 0.5} /></g>);
  else m = <path d={mouth === 'open' ? `M ${mx - 24} ${my - 4} Q ${mx} ${my + 44} ${mx + 24} ${my - 4} Z` : `M ${mx - 28} ${my - 6} Q ${mx} ${my + 34} ${mx + 28} ${my - 6} Z`} fill={INK} stroke={INK} strokeWidth={ow * 0.7} strokeLinejoin="round" />;
  const hc = o.hatColor, top = HY - HR, hx = dir * 6;
  const hatEl = (() => {
    const peak = dir || 1;                                                   // a cap's peak points where the character faces
    switch (o.hat) {
      case 'cap': return <g><path d={`M ${hx - 98} ${top + 46} C ${hx - 96} ${top - 24} ${hx + 96} ${top - 24} ${hx + 98} ${top + 46} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        {!back && <path d={`M ${hx + peak * 30} ${top + 44} Q ${hx + peak * 110} ${top + 36} ${hx + peak * 132} ${top + 56} Q ${hx + peak * 80} ${top + 62} ${hx + peak * 30} ${top + 56} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}</g>;
      case 'bowler': return <g><ellipse cx={hx} cy={top + 34} rx={124} ry={22} fill={hc} stroke={INK} strokeWidth={ow} />
        <path d={`M ${hx - 80} ${top + 34} C ${hx - 82} ${top - 56} ${hx + 82} ${top - 56} ${hx + 80} ${top + 34} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>;
      case 'top': return <g><rect x={hx - 66} y={top - 110} width={132} height={150} rx={8} fill={hc} stroke={INK} strokeWidth={ow} />
        <ellipse cx={hx} cy={top + 40} rx={118} ry={18} fill={hc} stroke={INK} strokeWidth={ow} /></g>;
      case 'hardhat': return <g><path d={`M ${hx - 92} ${top + 40} C ${hx - 92} ${top - 44} ${hx + 92} ${top - 44} ${hx + 92} ${top + 40} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <rect x={hx - 122} y={top + 32} width={244} height={20} rx={10} fill={hc} stroke={INK} strokeWidth={ow} /></g>;
      case 'beanie': return <g><path d={`M ${hx - 96} ${top + 50} C ${hx - 96} ${top - 40} ${hx + 96} ${top - 40} ${hx + 96} ${top + 50} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <rect x={hx - 100} y={top + 30} width={200} height={30} rx={12} fill={mix(hc, '#000000', 0.15)} stroke={INK} strokeWidth={ow} /><circle cx={hx} cy={top - 22} r={20} fill={hc} stroke={INK} strokeWidth={ow} /></g>;
      case 'fedora': return <g><ellipse cx={hx} cy={top + 40} rx={136} ry={20} fill={hc} stroke={INK} strokeWidth={ow} />
        <path d={`M ${hx - 74} ${top + 40} L ${hx - 64} ${top - 34} Q ${hx} ${top - 12} ${hx + 64} ${top - 34} L ${hx + 74} ${top + 40} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <path d={`M ${hx - 72} ${top + 14} L ${hx + 72} ${top + 14} L ${hx + 74} ${top + 36} L ${hx - 74} ${top + 36} Z`} fill={mix(hc, '#000000', 0.45)} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" /></g>;
      case 'police': return <g><path d={`M ${hx - 102} ${top + 42} L ${hx - 116} ${top - 4} Q ${hx} ${top - 50} ${hx + 116} ${top - 4} L ${hx + 102} ${top + 42} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <rect x={hx - 100} y={top + 22} width={200} height={20} rx={6} fill={mix(hc, '#000000', 0.45)} stroke={INK} strokeWidth={ow * 0.8} />
        {!back && <path d={`M ${hx - 84} ${top + 42} Q ${hx + (dir || 0) * 20} ${top + 80} ${hx + 84} ${top + 42} Z`} fill={INK} stroke={INK} strokeWidth={ow * 0.6} strokeLinejoin="round" />}
        {!back && <circle cx={hx} cy={top + 2} r={15} fill="#F2C94C" stroke={INK} strokeWidth={ow * 0.6} />}</g>;
      case 'helmet': return <g><circle cx={0} cy={HY} r={140} fill="#CFEFFF" fillOpacity={0.32} stroke={INK} strokeWidth={ow} />
        <rect x={-92} y={HY + 112} width={184} height={30} rx={12} fill="#DADFE6" stroke={INK} strokeWidth={ow} /></g>;
      default: return null;
    }
  })();
  const noHat = !o.hat || o.hat === 'none' || o.hat === 'helmet';
  const hand = (h: [number, number], i: number) => <circle key={'h' + i} cx={h[0]} cy={h[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={ow * 0.7} />;
  const tailSide = dir ? -dir : 1;                                           // ponytail hangs behind the head
  return (
    <g transform={`rotate(${lean}) scale(${sx} ${sy})`}>
      {/* thin line limbs */}
      <g stroke={INK} strokeWidth={limb} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {joints ? <>
          <path d={`M -18 ${-112 - bounce} L ${J.kneeL[0]} ${J.kneeL[1]} L ${footL[0]} ${footL[1] - 4}`} /><path d={`M 18 ${-112 - bounce} L ${J.kneeR[0]} ${J.kneeR[1]} L ${footR[0]} ${footR[1] - 4}`} />
          <path d={`M -34 ${-204 - bounce} L ${J.elbowL[0]} ${J.elbowL[1]} L ${handL[0]} ${handL[1]}`} /><path d={`M 34 ${-204 - bounce} L ${J.elbowR[0]} ${J.elbowR[1]} L ${handR[0]} ${handR[1]}`} />
        </> : <>
          <path d={`M -18 ${-112 - bounce} Q -22 -60 ${footL[0]} ${footL[1] - 4}`} /><path d={`M 18 ${-112 - bounce} Q 22 -60 ${footR[0]} ${footR[1] - 4}`} />
          <path d={arm([-34, -204], handL, -1)} /><path d={arm([34, -204], handR, 1)} />
        </>}
      </g>
      {handsBack && [handL, handR].map(hand)}
      {/* minimal feet, pointing where the character faces */}
      <ellipse cx={footL[0] + (dir || -1) * 8} cy={footL[1]} rx={17} ry={7.5} fill={INK} /><ellipse cx={footR[0] + (dir || 1) * 8} cy={footR[1]} rx={17} ry={7.5} fill={INK} />
      <g transform={`translate(0 ${-bounce})`}>
        {/* small narrow torso, flat colour */}
        <path d={TORSO} fill={o.shirt} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        {o.vest && !back && <g fill={o.vest} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round">
          <path d="M -40 -118 C -52 -166 -44 -226 -10 -229 L -6 -110 Q -24 -110 -40 -118 Z" /><path d="M 40 -118 C 52 -166 44 -226 10 -229 L 6 -110 Q 24 -110 40 -118 Z" /></g>}
        {o.vest && back && <path d={TORSO} fill={o.vest} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
        {o.buttons && !back && [-190, -160, -130].map((y) => <circle key={y} cx={o.vest ? 16 : 0} cy={y} r={5} fill={INK} />)}
        {o.scarf && <path d="M -30 -232 Q 0 -214 30 -232 L 26 -206 Q 0 -192 -26 -206 Z" fill={o.scarf} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />}
        {o.belt && <path d="M -41 -128 Q 0 -116 41 -128 L 40 -116 Q 0 -104 -40 -116 Z" fill={o.belt} stroke={INK} strokeWidth={ow * 0.7} strokeLinejoin="round" />}
        {o.coat && (o.coatStyle === 'lab' || o.coatStyle === 'trench') && <g strokeLinejoin="round">
          <path d="M -47 -92 C -60 -166 -50 -227 0 -233 C 50 -227 60 -166 47 -92 Q 0 -82 -47 -92 Z" fill={o.coat} stroke={INK} strokeWidth={ow} />
          {!back && <><path d="M -15 -229 L 15 -229 L 0 -168 Z" fill={o.shirt} stroke={INK} strokeWidth={ow * 0.7} />
            <path d="M 0 -168 L 0 -88" stroke={INK} strokeWidth={ow * 0.6} fill="none" />
            <path d="M -15 -229 L -26 -196 L -6 -186" stroke={INK} strokeWidth={ow * 0.6} fill="none" /><path d="M 15 -229 L 26 -196 L 6 -186" stroke={INK} strokeWidth={ow * 0.6} fill="none" />
            {o.coatStyle === 'lab' ? <rect x={14} y={-150} width={20} height={16} rx={3} fill="none" stroke={INK} strokeWidth={ow * 0.55} />
              : <>{[-176, -152].map((y) => [-1, 1].map((sd) => <circle key={y + '' + sd} cx={sd * 14} cy={y} r={4} fill={INK} />))}</>}</>}
          {o.coatStyle === 'trench' && <path d="M -52 -136 Q 0 -124 52 -136 L 51 -122 Q 0 -110 -51 -122 Z" fill={mix(o.coat, '#000000', 0.3)} stroke={INK} strokeWidth={ow * 0.7} />}</g>}
        {o.coat && o.coatStyle === 'suit' && <g strokeLinejoin="round">
          <path d={TORSO} fill={o.coat} stroke={INK} strokeWidth={ow} />
          {!back && <><path d="M -16 -229 L 16 -229 L 0 -160 Z" fill="#FFFFFF" stroke={INK} strokeWidth={ow * 0.7} />
            {o.tie && <path d="M -6 -226 L 6 -226 L 8 -216 L 4 -214 L 9 -176 L 0 -164 L -9 -176 L -4 -214 L -8 -216 Z" fill={o.tie} stroke={INK} strokeWidth={ow * 0.5} />}
            <path d="M -16 -229 L -30 -200 L -8 -182" stroke={INK} strokeWidth={ow * 0.6} fill="none" /><path d="M 16 -229 L 30 -200 L 8 -182" stroke={INK} strokeWidth={ow * 0.6} fill="none" />
            {[-148, -130].map((y) => <circle key={y} cx={6} cy={y} r={4.5} fill={INK} />)}</>}</g>}
        {o.apron && !back && <g strokeLinejoin="round"><path d="M -14 -224 L -22 -192 M 14 -224 L 22 -192" stroke={INK} strokeWidth={ow * 0.55} fill="none" />
          <path d="M -24 -194 L 24 -194 L 30 -112 Q 0 -102 -30 -112 Z" fill={o.apron} stroke={INK} strokeWidth={ow * 0.8} />
          <rect x={-12} y={-160} width={24} height={16} rx={3} fill="none" stroke={INK} strokeWidth={ow * 0.5} /></g>}
        {o.tie && !o.coat && !back && <path d="M -6 -228 L 6 -228 L 8 -218 L 4 -216 L 10 -160 L 0 -146 L -10 -160 L -4 -216 L -8 -218 Z" fill={o.tie} stroke={INK} strokeWidth={ow * 0.55} strokeLinejoin="round" />}
        {o.badge && !back && <path d={(() => { const cx = -20, cy = -186, R = 16, r = 6.6; return [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R; return `${i ? 'L' : 'M'} ${(cx + Math.cos(a) * q).toFixed(1)} ${(cy + Math.sin(a) * q).toFixed(1)}`; }).join(' ') + ' Z'; })()}
          fill={o.badge} stroke={INK} strokeWidth={ow * 0.45} strokeLinejoin="round" />}
        {/* head: one solid white disc, one outline */}
        <g transform={`rotate(${headTilt} 0 ${HY + HR})`}>
          {o.hair && o.hairStyle === 'sides' && [-1, 1].map((s) => <ellipse key={s} cx={s * 90} cy={HY + 8} rx={24} ry={42} fill={o.hair} stroke={INK} strokeWidth={ow} />)}
          {o.hair && o.hairStyle === 'long' && <path d={`M -108 ${HY - 20} C -130 ${HY + 60} -124 ${HY + 100} -92 ${HY + 112} L 92 ${HY + 112} C 124 ${HY + 100} 130 ${HY + 60} 108 ${HY - 20} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
          {o.hair && o.hairStyle === 'ponytail' && <path d={`M ${tailSide * 70} ${HY - 60} C ${tailSide * 170} ${HY - 40} ${tailSide * 170} ${HY + 80} ${tailSide * 130} ${HY + 140} C ${tailSide * 120} ${HY + 80} ${tailSide * 110} ${HY + 20} ${tailSide * 60} ${HY - 10} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
          {o.hair && o.hairStyle === 'bun' && <circle cx={0} cy={HY - 118} r={44} fill={o.hair} stroke={INK} strokeWidth={ow} />}
          <circle cx={0} cy={HY} r={HR} fill={back && o.hair ? o.hair : face} stroke={INK} strokeWidth={ow} />
          <defs><clipPath id={`${id}-head`}><circle cx={0} cy={HY} r={HR} /></clipPath></defs>
          {!back && o.hair && o.hairStyle !== 'sides' && noHat && <g clipPath={`url(#${id}-head)`}><path d={`M -120 ${HY - 16} L -120 ${HY - 130} L 120 ${HY - 130} L 120 ${HY - 16} L 100 ${HY - 16} C ${70 + dir * 10} ${HY - 70} ${10 + dir * 30} ${HY - 82} ${-30 + dir * 30} ${HY - 60} C ${-60 + dir * 20} ${HY - 72} -86 ${HY - 52} -100 ${HY - 16} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>}
          {!back && o.hair && o.hairStyle !== 'sides' && noHat && <circle cx={0} cy={HY} r={HR} fill="none" stroke={INK} strokeWidth={ow} />}
          {!back && <>
            {!o.sunglasses && <>{eye(-1)}{eye(1)}</>}{browD(-1)}{browD(1)}
            {o.sunglasses && <g>{[-1, 1].map((s) => { const ex = fx + s * (dir ? 27 : 34), w = dir !== 0 && s === dir ? 0.72 : 1;
              return <rect key={'sg' + s} x={ex - 27 * w} y={fy - 30} width={54 * w} height={36} rx={12} fill={INK} stroke={INK} strokeWidth={ow * 0.6} />; })}
              <path d={`M ${fx - (dir ? 4 : 8)} ${fy - 18} L ${fx + (dir ? 4 : 8)} ${fy - 18}`} stroke={INK} strokeWidth={ow * 0.7} /></g>}
            {o.glasses && !o.sunglasses && [-1, 1].map((s) => <circle key={'g' + s} cx={fx + s * (dir ? 27 : 34)} cy={fy - 10} r={26} fill="none" stroke={o.glassesColor ?? INK} strokeWidth={ow * (o.glassesColor ? 0.95 : 0.7)} />)}
            {o.mustache && <path d={`M ${mx} ${my - 12} C ${mx - 10} ${my - 22} ${mx - 34} ${my - 20} ${mx - 38} ${my - 6} C ${mx - 24} ${my - 10} ${mx - 10} ${my - 6} ${mx} ${my - 8} C ${mx + 10} ${my - 6} ${mx + 24} ${my - 10} ${mx + 38} ${my - 6} C ${mx + 34} ${my - 20} ${mx + 10} ${my - 22} ${mx} ${my - 12} Z`} fill={o.hair ?? INK} stroke={INK} strokeWidth={ow * 0.5} />}
            <g key={'mouth-' + mouth}>{m}</g>
            {o.cigarette && (() => { const sd = dir || 1; return <g transform={`translate(${mx + sd * 18} ${my + 6}) scale(${sd} 1) rotate(14)`}>
              <rect x={0} y={-4.5} width={46} height={9} rx={3} fill="#FFFFFF" stroke={INK} strokeWidth={ow * 0.45} /><rect x={38} y={-4.5} width={8} height={9} rx={2} fill="#FF7A2F" /></g>; })()}
            {spots > 0.01 && SPOTS.map(([x, y, r], i) => { const u = Math.max(0, Math.min(1, spots * SPOTS.length - i)); return u <= 0 ? null :
              <circle key={'sp' + i} cx={x + dir * 14} cy={HY + y} r={r * (u < 1 ? u * 1.25 : 1)} fill="#E5484D" stroke={INK} strokeWidth={ow * 0.45} />; })}
          </>}
          {o.headband && noHat && (() => { const ts = dir ? -dir : -1; return <g>
            <path d={`M ${ts * 88} ${HY - 50} C ${ts * 130} ${HY - 60} ${ts * 150} ${HY - 30} ${ts * 172} ${HY - 4} L ${ts * 154} ${HY + 6} C ${ts * 138} ${HY - 18} ${ts * 120} ${HY - 34} ${ts * 92} ${HY - 34} Z`} fill={o.headband} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />
            <path d={`M ${ts * 90} ${HY - 42} C ${ts * 126} ${HY - 30} ${ts * 140} ${HY + 2} ${ts * 150} ${HY + 34} L ${ts * 132} ${HY + 38} C ${ts * 124} ${HY + 8} ${ts * 112} ${HY - 18} ${ts * 92} ${HY - 28} Z`} fill={o.headband} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />
            <g clipPath={`url(#${id}-head)`}><rect x={-110} y={HY - 72} width={220} height={36} fill={o.headband} stroke={INK} strokeWidth={ow * 0.8} /></g>
            <circle cx={0} cy={HY} r={HR} fill="none" stroke={INK} strokeWidth={ow} /></g>; })()}
          {hatEl}
          {steam > 0.01 && [-1, 1].map((sd) => { const ph = (t * 1.6 + (sd > 0 ? 0.5 : 0)) % 1, sc = steam * Math.sin(Math.PI * ph);
            return <g key={'st' + sd} transform={`translate(${sd * (112 + ph * 36)} ${HY - 30 - ph * 80}) scale(${sc})`}><Puff c={[[-18, 0, 20], [8, -10, 24], [20, 8, 16]]} ow={7} /></g>; })}
          {sweat > 0.01 && !back && <g transform={`translate(${fx + 92} ${HY - 50}) scale(${sweat})`}>
            <path d="M 0 -26 C 10 -10 16 0 16 8 A 16 16 0 0 1 -16 8 C -16 0 -10 -10 0 -26 Z" fill="#8FD3FF" stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" /></g>}
        </g>
      </g>
      {o.hold && !handsBack && (() => { const sd = dir || 1, [px, py] = handR, k = o.hold;
        const st = {stroke: INK, strokeWidth: ow * 0.7, strokeLinejoin: 'round' as const};
        return <g transform={`translate(${px} ${py}) scale(${sd} 1)`}>
          {k === 'gun' && <path d="M -8 -26 L 58 -26 L 58 -10 L 16 -10 L 12 12 L -8 12 Z" fill="#33353B" {...st} />}
          {k === 'magnifier' && <><path d="M 0 0 L 24 -34" stroke={INK} strokeWidth={ow * 1.3} strokeLinecap="round" /><circle cx={42} cy={-58} r={28} fill="#DFF3FF" {...st} strokeWidth={ow * 1.1} /></>}
          {k === 'clipboard' && <><rect x={-6} y={-70} width={58} height={76} rx={6} fill="#B98552" {...st} /><rect x={2} y={-58} width={42} height={58} fill="#FFFFFF" {...st} strokeWidth={ow * 0.5} />
            <rect x={12} y={-76} width={22} height={12} rx={3} fill="#9AA0A6" {...st} strokeWidth={ow * 0.5} />{[-44, -32, -20].map((y) => <path key={y} d={`M 9 ${y} L 37 ${y}`} stroke={INK} strokeWidth={ow * 0.4} />)}</>}
          {k === 'briefcase' && <><path d="M 4 6 Q 4 -8 18 -8 L 30 -8 Q 44 -8 44 6" fill="none" stroke={INK} strokeWidth={ow * 0.8} /><rect x={-14} y={6} width={76} height={52} rx={8} fill="#7A4A2A" {...st} />
            <path d="M -14 26 L 62 26" stroke={INK} strokeWidth={ow * 0.5} /></>}
          {k === 'coffee' && <><path d="M -10 -44 L 26 -44 L 22 8 L -6 8 Z" fill="#FFFFFF" {...st} /><rect x={-12} y={-50} width={40} height={10} rx={3} fill="#5B3A29" {...st} strokeWidth={ow * 0.5} />
            <rect x={-8} y={-26} width={32} height={14} fill="#C9A27A" stroke="none" /></>}
          {k === 'phone' && <rect x={-4} y={-44} width={24} height={44} rx={5} fill="#2B2B30" {...st} />}
          {k === 'wrench' && <path d="M -4 6 L 40 -38 M 34 -48 A 14 14 0 1 0 52 -30" stroke="#8C939B" strokeWidth={ow * 1.6} fill="none" strokeLinecap="round" />}
        </g>; })()}
      {!handsBack && [handL, handR].map(hand)}
    </g>
  );
};
````

### `src/Poses.ts`
````ts
/* Named poses + expressions for the flat cast (Cast.tsx -> Person), and helpers to blend between them.
 * A pose sets the body (hands, feet, joints, lean, bounce, head tilt, view); an expression sets the face
 * (eyes, brows, mouth, look, face colour). Use them together:  <Person id="blob" outfit={BLOB} {...act(t, ...)} />
 * Units: feet at (0,0), head centre (0,-330), shoulders (±34,-204), hips (±18,-112). Negative x = screen left. */
import {PersonPose, jointsFor} from './Cast';
import {clamp, lerp, eio} from './math';

export type Pose = Partial<Omit<PersonPose, 'id' | 'outfit'>>;
type P2 = [number, number];

// ---------------------------------------------------------------- body poses
export const POSES: Record<string, Pose> = {
  stand:       {handL: [-78, -120], handR: [78, -120], footL: [-30, -5], footR: [30, -5]},
  relaxed:     {handL: [-60, -112], handR: [66, -116], footL: [-34, -5], footR: [28, -5], lean: 2, headTilt: 3},
  wave:        {handL: [-72, -118], handR: [128, -340], footL: [-30, -5], footR: [30, -5], headTilt: 5},
  point:       {handL: [-72, -120], handR: [178, -222], footL: [-34, -5], footR: [36, -5], lean: 4, view: 'right'},
  pointUp:     {handL: [-72, -120], handR: [70, -392], footL: [-30, -5], footR: [30, -5], headTilt: -4},
  explain:     {handL: [-118, -168], handR: [124, -176], footL: [-32, -5], footR: [32, -5], headTilt: 4},
  shrug:       {handL: [-128, -214], handR: [128, -214], elbowL: [-82, -168], elbowR: [82, -168], footL: [-30, -5], footR: [30, -5], headTilt: 9, bounce: 4},
  facepalm:    {handL: [-70, -118], handR: [14, -318], footL: [-30, -5], footR: [30, -5], headTilt: -12, lean: -3},
  handsOnHead: {handL: [-62, -432], handR: [62, -432], elbowL: [-120, -320], elbowR: [120, -320], footL: [-34, -5], footR: [34, -5]},
  think:       {handL: [16, -160], handR: [30, -236], elbowL: [-50, -150], elbowR: [72, -168], footL: [-30, -5], footR: [30, -5], headTilt: 7},
  crossArms:   {handL: [58, -176], handR: [-58, -168], elbowL: [-64, -136], elbowR: [64, -132], footL: [-34, -5], footR: [34, -5], headTilt: -3},
  holdFront:   {handL: [-26, -150], handR: [26, -150], footL: [-30, -5], footR: [30, -5]},
  reach:       {handL: [-80, -150], handR: [196, -262], footL: [-40, -5], footR: [40, -5], lean: 9, view: 'right'},
  cheer:       {handL: [-118, -410], handR: [118, -410], footL: [-38, -5], footR: [38, -5], bounce: 10, headTilt: -4},
  sad:         {handL: [-42, -98], handR: [42, -98], footL: [-24, -5], footR: [24, -5], bounce: -8, headTilt: 10, lean: 2},
  scared:      {handL: [-40, -262], handR: [40, -262], elbowL: [-92, -200], elbowR: [92, -200], footL: [-46, -5], footR: [46, -5], bounce: -22, lean: -4},
  crouch:      {handL: [-58, -66], handR: [58, -66], footL: [-52, -5], footR: [52, -5], bounce: -64},
  // side-view poses (view 'right'; mirror with mirrorPose for 'left')
  sit:         {view: 'right', bounce: -56, kneeL: [64, -62], kneeR: [80, -60], footL: [66, -5], footR: [82, -5], handL: [50, -70], handR: [70, -68]},
  sitThink:    {view: 'right', bounce: -56, kneeL: [64, -62], kneeR: [80, -60], footL: [66, -5], footR: [82, -5], handL: [58, -70], handR: [34, -190], elbowR: [70, -118], headTilt: 8},
  kneel:       {view: 'right', bounce: -52, kneeL: [-30, -10], footL: [-92, -12], kneeR: [62, -70], footR: [66, -5], handL: [-44, -104], handR: [58, -78]},
  kick:        {view: 'right', handL: [-118, -196], handR: [70, -236], footL: [-26, -5], footR: [142, -122], kneeR: [64, -96], lean: -10},
  jump:        {handL: [-120, -380], handR: [120, -380], footL: [-46, -54], footR: [46, -54], kneeL: [-58, -82], kneeR: [58, -82], bounce: 0},
  fall:        {handL: [-150, -320], handR: [154, -276], footL: [-40, -5], footR: [78, -64], lean: 22, headTilt: 14},
  run:         {view: 'right', handL: [-56, -150], handR: [78, -200], elbowL: [-60, -188], elbowR: [70, -150], footL: [-70, -36], footR: [52, -5], kneeL: [-34, -60], kneeR: [44, -54], lean: 10},
};
/** mirror a side-view pose (right <-> left) */
export const mirrorPose = (p: Pose): Pose => {
  const m = (v?: P2) => (v ? [-v[0], v[1]] as P2 : undefined), o: Pose = {...p};
  o.handL = m(p.handR); o.handR = m(p.handL); o.footL = m(p.footR); o.footR = m(p.footL);
  o.elbowL = m(p.elbowR); o.elbowR = m(p.elbowL); o.kneeL = m(p.kneeR); o.kneeR = m(p.kneeL);
  o.view = p.view === 'right' ? 'left' : p.view === 'left' ? 'right' : p.view;
  if (p.lean) o.lean = -p.lean; if (p.headTilt) o.headTilt = -p.headTilt;
  return o;
};

// ---------------------------------------------------------------- expressions (face only)
export const EXPR: Record<string, Pose> = {
  neutral:    {eyes: 'dot', mouth: 'flat', brow: 0, browUp: 0},
  happy:      {eyes: 'dot', mouth: 'smile', brow: 0, browUp: 0.2},
  joy:        {eyes: 'closed', mouth: 'grin', brow: 0, browUp: 0.5},
  shocked:    {eyes: 'wide', mouth: 'o', brow: 0, browUp: 1},
  scared:     {eyes: 'wide', mouth: 'wavy', brow: -1, browUp: 0.6, sweat: 1, tint: '#BFE6FF', tintAmt: 0.55},
  angry:      {eyes: 'dot', mouth: 'flat', brow: 1, browUp: -0.2},
  furious:    {eyes: 'squeeze', mouth: 'teeth', brow: 1, browUp: -0.3, tint: '#F2564E', tintAmt: 1, steam: 1},
  sad:        {eyes: 'dot', mouth: 'frown', brow: -1, browUp: 0.3, faceDy: 10, lookY: 6},
  sick:       {eyes: 'squeeze', mouth: 'wavy', brow: -0.6, browUp: 0.2, tint: '#7BD66A', tintAmt: 0.9},
  smug:       {eyes: 'closed', mouth: 'smirk', brow: 0.2, browUp: 0.3},
  confused:   {eyes: 'dot', mouth: 'wavy', brow: -0.5, browUp: 0.4, lookX: 6},
  thinking:   {eyes: 'dot', mouth: 'flat', brow: 0, browUp: 0.6, lookX: 10, lookY: -12, faceDy: -6},
  nervous:    {eyes: 'dot', mouth: 'wavy', brow: -0.7, browUp: 0.4, sweat: 1},
  sleepy:     {eyes: 'closed', mouth: 'flat', brow: 0, browUp: -0.2},
  determined: {eyes: 'dot', mouth: 'flat', brow: 0.8, browUp: -0.2},
  freezing:   {eyes: 'squeeze', mouth: 'teeth', brow: -0.6, browUp: 0.3, tint: '#A9DBFF', tintAmt: 1},
  awe:        {eyes: 'wide', mouth: 'o', brow: -0.2, browUp: 0.8, lookY: -14, faceDy: -10},
  grin:       {eyes: 'dot', mouth: 'grin', brow: 0, browUp: 0.4},
};

// ---------------------------------------------------------------- blending
const DISCRETE = new Set(['view', 'eyes', 'mouth', 'handsBack', 'tint', 'joints']);
const resolve = (p: Pose): Pose => ({...p, ...jointsFor(p)});          // fill every joint so joints always blend smoothly
/** blend two poses (names or objects), k 0..1; numbers and points interpolate, view / eyes / mouth switch at k = 0.5 */
export const blendPose = (a: Pose | string, b: Pose | string, k: number): Pose => {
  const A = resolve(typeof a === 'string' ? POSES[a] ?? EXPR[a] : a), B = resolve(typeof b === 'string' ? POSES[b] ?? EXPR[b] : b);
  k = clamp(k); const out: any = {};
  for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) {
    const va: any = (A as any)[key], vb: any = (B as any)[key];
    if (DISCRETE.has(key)) { out[key] = k < 0.5 ? (va ?? vb) : (vb ?? va); continue; }
    if (Array.isArray(va) || Array.isArray(vb)) { const x = va ?? vb, y = vb ?? va; out[key] = [lerp(x[0], y[0], k), lerp(x[1], y[1], k)]; continue; }
    if (typeof va === 'number' || typeof vb === 'number') { out[key] = lerp(va ?? 0, vb ?? 0, k); continue; }
    out[key] = k < 0.5 ? (va ?? vb) : (vb ?? va);
  }
  if (out.tint && (A.tint !== B.tint)) out.tintAmt = A.tint && B.tint ? out.tintAmt : (A.tint ? (A.tintAmt ?? 0) * (1 - k) : (B.tintAmt ?? 0) * k);   // face colour fades, never pops
  if (!A.tint && B.tint) out.tint = B.tint; if (A.tint && !B.tint) out.tint = A.tint;
  return out;
};
/** step through keyed poses over time: posesAt(t, [[0, 'stand'], [1.2, 'shrug'], ...], 0.3) — each change blends over `dur` s */
export const posesAt = (t: number, keys: [number, Pose | string][], dur = 0.3): Pose => {
  let cur: Pose | string = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ti, p] = keys[i]; if (t < ti) break;
    const k = (t - ti) / dur; if (k < 1) return blendPose(cur, p, eio(k));
    cur = p;
  }
  return typeof cur === 'string' ? resolve(POSES[cur] ?? EXPR[cur]) : resolve(cur);
};
/** body + face together: act(t, bodyKeys, faceKeys) */
export const act = (t: number, body: [number, Pose | string][], face: [number, Pose | string][] = [[0, 'happy']], dur = 0.3): Pose =>
  ({...posesAt(t, body, dur), ...posesAt(t, face, dur * 0.8)});
/** small life on any held pose: breathing bounce and a slight head sway (whole cycles, so loops stay clean) */
export const breathe = (p: Pose, t: number, amt = 1): Pose => ({...p, bounce: (p.bounce ?? 0) + Math.sin(t * 2 * Math.PI * 0.5) * 2.5 * amt, headTilt: (p.headTilt ?? 0) + Math.sin(t * 2 * Math.PI * 0.25) * 1.5 * amt});
/** walk / run cycle seen from the side. phase advances 2*PI per stride pair (one left + one right step). */
export const walk = (phase: number, o: {stride?: number; lift?: number; run?: boolean; view?: 'right' | 'left'} = {}): Pose => {
  const run = !!o.run, S = o.stride ?? (run ? 58 : 50), L = o.lift ?? (run ? 46 : 30), view = o.view ?? 'right', d = view === 'right' ? 1 : -1;
  const foot = (ph: number): P2 => [d * S * Math.sin(ph), -5 - L * Math.max(0, Math.cos(ph))];
  const hand = (ph: number): P2 => run ? [d * (20 + 46 * Math.sin(ph)), -170 - 30 * Math.max(0, Math.sin(ph))] : [d * 52 * Math.sin(ph), -122 + 8 * Math.cos(2 * ph)];
  return {view, footL: foot(phase), footR: foot(phase + Math.PI), handL: hand(phase + Math.PI), handR: hand(phase),
    bounce: (run ? 10 : 5) * Math.abs(Math.cos(phase)) - (run ? 8 : 0), lean: d * (run ? 9 : 2)};
};
````

### `src/Roles.ts`
````ts
/* The cast for Blob the Brilliant.
 * BLOB is fixed in every video (brand character): white face, black hair on top, teal shirt #1FA6A0.
 * A costume is allowed only when the story needs one (costume('prison'), ...) - head, hair and face never change.
 * Supporting roles are TEMPLATES: each keeps its signature items, while colours, hair and accessories change per video.
 * Pass a different seed per video (e.g. the short's name) to get a new-looking scientist / boss / police officer.
 * Rules: no supporting role ever wears Blob's teal; no bun hairstyle on anyone (it reads as a brown circle / turban);
 * variety comes from caps, hats, headbands, glasses, sunglasses and held props instead. */
import {Outfit} from './Cast';
import {INK} from './color';

export const BLOB_TEAL = '#1FA6A0', BRAND_YELLOW = '#FFC83D';
export const BLOB: Outfit = {shirt: BLOB_TEAL, hair: INK, hairStyle: 'short'};

/** story costumes for Blob (head, hair and face stay Blob's) */
export const COSTUMES: Record<string, Outfit> = {
  prison:    {...BLOB, shirt: '#F08A24', buttons: true},
  astronaut: {...BLOB, shirt: '#ECEFF3', belt: '#5B6270', badge: '#E5484D', hat: 'helmet'},
  chef:      {...BLOB, shirt: '#FFFFFF', apron: '#F2F2F2', scarf: '#E5484D'},
  winter:    {...BLOB, scarf: '#E5484D', hat: 'beanie', hatColor: '#E5484D'},
  scientist: {...BLOB, coat: '#F7F7F2', coatStyle: 'lab', glasses: true, hold: 'clipboard'},
  worker:    {...BLOB, vest: '#FF8A1F', hat: 'hardhat', hatColor: '#FFD23F', hold: 'wrench'},
  detective: {...BLOB, coat: '#C8A46B', coatStyle: 'trench', hat: 'fedora', hatColor: '#3A3330', hold: 'magnifier'},
  athlete:   {...BLOB, headband: '#E5484D'},
};
export const costume = (name: string): Outfit => COSTUMES[name] ?? BLOB;

// deterministic choice from a seed (string or number), so the same video always gets the same look
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; };   // FNV-1a + murmur finaliser = even spread
const chooser = (seed: string | number, salt: string) => { let n = 0; return <T,>(arr: T[]): T => arr[hash(`${seed}|${salt}|${n++}`) % arr.length]; };

type HS = Outfit['hairStyle'];
const HAIR = ['#151515', '#3B2416', '#6B4423', '#A0522D', '#D9A441', '#C0392B'];
const GREY = ['#8E8E8E', '#BDBDBD', '#E6E6E6'];
const CASUAL = ['#E5484D', '#3F7FD9', '#8E5BD6', '#F2994A', '#E85D9E', '#4CAF50', '#F2C94C', '#56CCF2'];   // no teal
const SPORT = ['#E5484D', '#2F5BEA', '#8E5BD6', '#F2994A', '#111827', '#4CAF50', '#FFFFFF'];

export type RoleName = 'scientist' | 'boss' | 'guard' | 'police' | 'detective' | 'athlete' | 'friend' | 'kid' | 'worker';
export type RoleLook = {outfit: Outfit; size: number; signature: string};
export const ROLES: Record<RoleName, (seed: string | number) => RoleLook> = {
  scientist: (seed) => { const c = chooser(seed, 'scientist'); const hs = c<HS>(['short', 'sides', 'long', 'ponytail', 'short']);
    return {signature: 'lab coat + glasses (+ clipboard)', size: 1, outfit: {coat: '#F7F7F2', coatStyle: 'lab', glasses: true,
      glassesColor: c([undefined, '#E5484D', '#2F5BEA', '#8E5BD6', '#F2994A']), shirt: c(['#7FB3E8', '#B79CE6', '#8FD18A', '#F2B36B', '#E8848A', '#F2C94C']),
      hair: hs === 'sides' ? c(GREY) : c([...HAIR, ...GREY]), hairStyle: hs, mustache: (hs === 'sides' || hs === 'short') && c([false, false, true]),
      tie: c([undefined, '#2E3A59', '#B03A48', '#2F5BEA']), hold: c([undefined, 'clipboard', 'clipboard', 'coffee'])}}; },
  boss: (seed) => { const c = chooser(seed, 'boss');
    return {signature: 'suit jacket + tie (+ briefcase / coffee / phone)', size: 1.05, outfit: {coat: c(['#24324F', '#5B1F2A', '#2F4F3A', '#4A2F5E', '#8A6A3E', '#2B2B30', '#7A7F88']), coatStyle: 'suit', shirt: '#FFFFFF',
      tie: c(['#E5484D', '#F2C94C', '#8E5BD6', '#2F5BEA', '#4CAF50']), hair: c([...HAIR, ...GREY]), hairStyle: c<HS>(['short', 'sides', 'short']),
      mustache: c([false, false, true]), sunglasses: c([false, false, false, true]), hat: c<Outfit['hat']>(['none', 'none', 'none', 'none', 'bowler', 'top']), hatColor: '#1E1E22',
      hold: c([undefined, 'briefcase', 'coffee', 'phone'])}}; },
  guard: (seed) => { const c = chooser(seed, 'guard'); const u = c(['#22365C', '#4A4A55', '#6B6A3A', '#7A2E2E', '#2F5D9E', '#3F5F4A']);
    return {signature: 'uniform + cap + big gold badge', size: 1, outfit: {shirt: u, hat: 'cap', hatColor: c([u, '#151515']), badge: '#F2C94C', belt: '#151515',
      buttons: true, hair: c(HAIR), hairStyle: 'short', mustache: c([false, false, true]), sunglasses: c([false, false, true]), hold: c([undefined, undefined, 'phone', 'coffee'])}}; },
  police: (seed) => { const c = chooser(seed, 'police'); const u = c(['#1E2F55', '#2C4A86', '#24324F', '#3B5BA8']);
    return {signature: 'police hat + badge + gun', size: 1.02, outfit: {shirt: u, hat: 'police', hatColor: c([u, '#151515']), badge: '#F2C94C', belt: '#151515',
      buttons: true, hair: c(HAIR), hairStyle: 'short', mustache: c([false, true]), sunglasses: c([false, true]), hold: 'gun'}}; },
  detective: (seed) => { const c = chooser(seed, 'detective');
    return {signature: 'trench coat + fedora + sunglasses + magnifier', size: 1, outfit: {coat: c(['#C8A46B', '#8A6A4A', '#6E6E73', '#4A3A2A', '#A9925E']), coatStyle: 'trench',
      shirt: '#FFFFFF', tie: c([undefined, '#151515', '#7A2E2E']), hat: 'fedora', hatColor: c(['#3A3330', '#2B2B30', '#5A4632', '#6E6E73']),
      sunglasses: c([true, true, false]), glasses: true, hair: c(HAIR), hairStyle: 'short', mustache: c([false, true]), cigarette: c([false, false, true]), hold: 'magnifier'}}; },
  athlete: (seed) => { const c = chooser(seed, 'athlete'); const shirt = c(SPORT);
    return {signature: 'sports shirt + headband with ribbon', size: 1, outfit: {shirt, headband: c(['#E5484D', '#2F5BEA', '#F2C94C', '#F2994A', '#E85D9E', '#8E5BD6'].filter((x) => x !== shirt)), hair: c(HAIR),
      hairStyle: c<HS>(['short', 'ponytail', 'short']), sunglasses: c([false, false, false, true])}}; },
  friend: (seed) => { const c = chooser(seed, 'friend');
    return {signature: 'bright casual shirt + one accessory', size: 1, outfit: {shirt: c(CASUAL), hair: c(HAIR), hairStyle: c<HS>(['short', 'long', 'ponytail', 'sides', 'short']),
      ...c<Partial<Outfit>>([{}, {hat: 'cap', hatColor: c(CASUAL)}, {hat: 'beanie', hatColor: c(CASUAL)}, {scarf: c(CASUAL)}, {glasses: true, glassesColor: c(CASUAL)}, {sunglasses: true}, {hold: 'phone'}, {hold: 'coffee'}])}}; },
  kid: (seed) => { const c = chooser(seed, 'kid');
    return {signature: 'smaller size + bright shirt', size: 0.72, outfit: {shirt: c(CASUAL), hair: c(HAIR.slice(0, 5)), hairStyle: c<HS>(['short', 'ponytail', 'short']),
      ...c<Partial<Outfit>>([{}, {hat: 'cap', hatColor: c(CASUAL)}, {scarf: c(CASUAL)}, {headband: c(CASUAL)}, {glasses: true, glassesColor: c(CASUAL)}])}}; },
  worker: (seed) => { const c = chooser(seed, 'worker');
    return {signature: 'hard hat + high-vis vest (+ wrench)', size: 1.02, outfit: {shirt: c(['#3F7FD9', '#6B6A3A', '#5B5B66', '#8C4A2F', '#2F5BEA']), vest: c(['#FF8A1F', '#D4E157']),
      hat: 'hardhat', hatColor: c(['#FFD23F', '#FF8A1F', '#F2F2F2', '#E5484D']), hair: c(HAIR), hairStyle: 'short', mustache: c([false, true]), hold: c(['wrench', 'wrench', 'coffee', undefined])}}; },
};
/** one supporting character for a video: role('scientist', 'pink-cell') */
export const role = (name: RoleName, seed: string | number): RoleLook => ROLES[name](seed);
````