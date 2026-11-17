# Paper Billions: frame-by-frame study of a reference video

**Reference:** *How a Chinese Spy Got Inside Nvidia* (downloaded as `vidssave.com How a Chinese Spy Got Inside Nvidia 720P.mp4`).
**Purpose:** a complete list of everything the video uses, so we can build **our own original** 16:9 finance channel (money lessons + real money stories, US audience, up to 10 min) in a similar flat 2D look. This is a style study. Nothing here is meant to be copied 1:1: no characters, scenes, scripts or layouts.

**Evidence and how this was made**

| Item | Where |
|---|---|
| Video copy | `D:\HarryShorts\study\video.mp4` (local only) |
| 594 frames, one every 2 s | `D:\HarryShorts\study\frames\tNNNN.jpg` (t0000 = 0:00, t0001 = 0:02, ... frame = seconds / 2) |
| 354 frames at the cuts (taken 0.15 s after each cut) | `D:\HarryShorts\study\cuts\cNNN_<seconds>.jpg` |
| 61 contact sheets, all reviewed | `D:\HarryShorts\study\sheets\s01-s38.jpg` (4x4, 32 s per sheet) and `cut01-cut23.jpg` (16 cuts per sheet) |
| Full-size stills and 10 fps motion strips | `D:\HarryShorts\study\full\`, `motion1.jpg` (0:21.9-0:24.3), `motion2.jpg` (5:45-5:47.4) |
| Transcript (faster-whisper small.en, word timestamps) | `D:\HarryShorts\study\transcript.txt / .json` |
| **Transcript lined up with frames and shots, all 520 lines** | **[paper-billions-transcript.md](paper-billions-transcript.md)** (in the repo) |
| Running viewing notes | `D:\HarryShorts\study\notes.md` |
| Audio tags (AudioSet classifier, 10 s windows every 5 s) | `D:\HarryShorts\study\audiotags.json` |

Tools: ffmpeg 9 (probe, scene detection `select='gt(scene,0.3)'`, frame grabs, loudness `ebur128`, `silencedetect`), faster-whisper (speech-to-text), an AudioSet sound classifier (MIT AST), and pitch estimation per line. Frame references below use the form `t0123` (2 s grid) or `c045` (cut frame).

**One correction to the brief up front:** the look is **not** "drawn on paper". It is clean flat vector cut-out animation with soft digital lighting: gradients, glows, vignettes, depth-of-field blur, light bloom. There is **no paper grain, no texture, no pencil wobble** anywhere (checked on full-size frames `full/f_6.5.png`, `f_116.png`, `f_1131.png`). "Paper" only shows up as **props**: notes, clipboards, newspapers, polaroids, ledgers and sticky notes are the main way information is delivered. If we want a real paper texture, that would be our own original twist (see section M).

---

## A. Overview

| Metric | Value |
|---|---|
| Title (on screen at 0:40, `t0020`) | "HOW A CHINESE SPY GOT INSIDE NVIDIA" (the word SPY in red) |
| Length | **19:47.90** (1187.9 s) |
| Video | 1280x720 (16:9), **30 fps**, H.264 ~968 kb/s (YouTube 720p download) |
| Audio | AAC stereo 44.1 kHz; integrated loudness **-14.3 LUFS**, loudness range **2.2 LU** (heavily compressed, YouTube-normalised) |
| Hard cuts detected (scene score > 0.3) | **354** → 355 shots |
| Cuts per minute | **17.9** on average. Per minute 0-19: 23, 19, 19, 8, 17, 18, 20, 32, 18, 6, 13, 19, 20, 18, 12, 18, 17, 19, 22, 16 |
| Average shot length | **3.35 s** (median 2.53 s) |
| Real pace | **Faster than the cut count says.** Many "shots" contain animated changes with no hard cut: counters rolling, calendar flips, camera push-ins, props sliding in, split panels opening. Something new happens on screen roughly **every 1.5-2 s**. |
| Longest shots | 9:43.3-10:09.5 (**26.2 s**, NSA-style listening room: one slow push-in with UI typing on, `t0292-t0304`); 9:09.5-9:32.5 (23.0 s, warehouse torch inspection); 2:58.4-3:15.4 (17.0 s, stage chip reveal + chef analogy); 14:36.7-14:53.5 (16.8 s, New Matrix burger desk + empty office); 3:15.4-3:31.7 (16.3 s, kid's bedroom → data centre); 5:19.9-5:34.6 (14.7 s, meeting room → MSS building) |
| Shortest shots | Flash and strobe effects: 7:50.0-7:50.4 (camera-flash white frames, 0.03-0.13 s, `c146-c151`), 15:43.6-15:44.4 (surveillance shutter strobe, 0.03-0.2 s, `c271-c277`), 0:37.2 (viewfinder shutter jolt), 0:41.7 (title → chapter card) |
| Slowest minutes | Minute 3 (8 cuts: long analogy shots) and minute 9 (6 cuts: warehouse and listening room). Long shots are used for **suspense**, not exposition. |
| Busiest minute | Minute 7 (32 cuts): Megaspeed set-up, ledger, planner, whiskey bar, photo flash |
| Narration | 3,150 words → **159 wpm** overall, **~188 wpm** while someone is speaking |
| Black text cards (narration line typed on black) | **~45**, plus **8 chapter cards** + 1 title card (53 dark-frame groups on the 2 s grid) |

---

## B. Structure

### B1. Cold open, second by second (0:00-0:42)

| Time | Audio (narration / dialogue) | Screen | Evidence |
|---|---|---|---|
| 0:00-0:01 | "In Singapore, the boss of the most valuable company on Earth..." | Already moving: two-shot of the Jensen caricature and Alice at a candle-lit table, red roses, wine; a **glowing green chip** sits on the cloth with a hand on it; dark location tag **SINGAPORE** bottom-left | `t0000` |
| 0:02-0:03 | "...on Earth..." | Cutaway: dark navy map of the Americas with glowing 3D light pillars (data centres), one green pillar with the chip eye on it | `t0001` |
| 0:04-0:05 | "...is having dinner with a Chinese spy." | **Black text card**, white handwritten type, the words appear as they are spoken: "having dinner with a (Chinese spy)" | `t0002`, `c001` |
| 0:06-0:08 | "He's Jensen Huang, who runs NVIDIA." | Close-up of Jensen laughing, fork raised; lower third **JENSEN HUANG** types on (dark see-through box, green bar on the left) | `t0003`, `full/f_6.5.png` |
| 0:08-0:09 | "She's Alice Huang, no relation." | Whip-pan with motion blur across to Alice | `t0004` |
| 0:10-0:12 | "And she runs one of his biggest customers." | Wide shot with waiter; a **VIP CUSTOMER** plaque and a stack of green NVIDIA crates appear beside Alice | `t0005-t0006`, `c003` |
| 0:13-0:14 | "**But here's the strange part.**" | Through a rain-streaked window from outside; then rainy hotel exterior at night, "HOTEL" | `c004`, `t0007` |
| 0:15-0:17 | "Somewhere nearby, American agents are taking pictures." | Two agents in a dark room, one with a long telephoto lens; **3 polaroids pop out** one by one above them | `t0008`, `c005-c006` |
| 0:18-0:20 | "They know exactly who she is." | Corkboard: SINGAPORE note, ALICE HUANG name card, polaroid, red string, red "MSS" tab, a sleeve-arm points | `t0009`, `c007` |
| 0:20-0:21 | "Jensen has no idea." | Black text card | `t0010`, `c008` |
| 0:22-0:25 | Dialogue: "**To our customers!**" / "**To friends!**" | Toast close-up, glasses clink; lip-synced mouths, slow push-in | `t0011-t0012`, `motion1.jpg` |
| 0:25-0:29 | "Under that table, her company is buying billions of dollars of his chips." | Under-table shot: suit hand and a woman's hand pass a glowing green chip; red heels; NVIDIA crates; green handwritten **$ BILLIONS** | `t0013-t0014`, `full/f_27.png` |
| 0:29-0:31 | "The kind China isn't allowed to have." | Black text card | `t0015` |
| 0:32-0:35 | "This is the story of how China got a spy into that seat." | Top-down view of the table; a red loop circles Alice's seat; red rubber stamp **CHINA** slams in | `t0016-t0017`, `c012` |
| 0:36-0:37 | "**And who was watching?**" | Camera-viewfinder POV through the restaurant window: crosshair, corner brackets, "600mm f/4", shutter jolt | `t0018`, `c013-c014` |
| 0:37-0:39 | "It starts with a phone call from Washington." | Dark desk, rotary phone vibrating with ring arcs, Capitol dome in the window | `t0019`, `c015` |
| 0:40-0:41 | (music hit) | **Title** over the desk scene: "HOW A CHINESE SPY GOT INSIDE NVIDIA" (SPY red), TOP SECRET folder, green lamp | `t0020`, `c016` |
| 0:42-0:43 | (silence/beat) | **Chapter card 1: "The Man With the Key"** | `t0021`, `c017` |

**What the hook does:** (1) the first frame is already a scene in motion (no logo, no intro); (2) the most shocking sentence comes first ("having dinner with a Chinese spy"); (3) **dramatic irony** at 0:18-0:21: we know and he doesn't; (4) a voiced toast makes it feel like a film; (5) a stakes number ("billions") by 0:28; (6) an open question ("And who was watching?"); (7) a promise of where it starts ("a phone call from Washington"), which is paid off **3.5 minutes later** at 4:34. The title card comes at **0:40**, after the hook.

### B2. Chapters (from the black chapter cards)

| # | Card | Time | Content | Evidence |
|---|---|---|---|---|
| 0 | Cold open + title | 0:00-0:42 | Singapore dinner, surveillance, thesis | `s01-s02` |
| 1 | **The Man With the Key** | 0:42-4:32 | Origin story: Taiwan at 9 → Kentucky reform school (bathrooms, bully roommate) → Huang Hall → Denny's dishwasher → Nvidia founded in a Denny's booth ($600) → 30 days from bankruptcy → GPU explained (chef vs 10,000 line cooks) → ChatGPT → AI line ("take a number") → 86% share → plaque → $5T → "now holds the key to AI" → "the one man China needed most" | `c017`, `s02-s09` |
| 2 | **The Locked Door** | 4:32-6:02 | Oct 2022 export-control call, $17B/yr lost, "a new car per chip", 95% → 0; MSS explained ("FBI and CIA in one building"), the handler's brief to Alice ("We make friends.") | `t0136`, `s09-s12` |
| 3 | **The Cover** | 6:02-7:18 | 7Road → Megaspeed in Singapore, cover story checklist, rent-don't-buy model (car-keys-by-the-hour analogy), $33M company, Jensen's full diary | `t0181`, `s12-s14` |
| 4 | **The Approach** | 7:18-10:20 | Jensen is easy to meet (4.5T, spokesman quote), June 2024 Taipei whiskey photo, Malaysia loan ("collateral: everything"), shipments → $2B ≈ 60,000 chips, $33M → $3B (90x), lemonade stand, Commerce inspector finds "very advanced boxes", Nvidia audit "all in place", **twist: US spies already listening**, unmasking reveals "Jensen Huang", call log | `t0219`, `s14-s20` |
| 5 | **The Pipeline** | 10:20-11:50 | Aivres (US arm of blacklisted Inspur) as server-rack characters, $4.6B in, $4.8B total, "older cousin who buys beer" analogy, lobster smugglers ($160M bust = 3%), cost/return ledger | `t0310`, `s20-s23` |
| 6 | **What She Was After** | 11:50-15:40 | The prize is the man, not blueprints; Nvidia "zero information" statement; Washington flip-flops (blocked → 15% → 25%); $4.5B = $13 per American; Jensen's public lobbying quotes (Computex, earnings call, London, social post); "Now look at it from Beijing"; New Matrix hollow office (NYT); Megaspeed walks away from $3.2B; Sen. Cotton; NYT $2B; landlord pulls power; case to DOJ | `t0355`, `s23-s30` |
| 7 | **The Memo** | 15:40-16:30 | A year of surveillance (photos, Taipei video), Rubio memo text, small-group meeting, President briefed, Jensen flown to Alaska for Air Force One | `t0470`, `s30-s31` |
| 8 | **The Empty Chair** | 16:30-19:48 | NYT breaks story (Oct 29 2026), stock -3%, Jensen to Bloomberg, Beijing denial, congressional briefing, memo leaks yet stock up 2.78%, **"Why did nobody tell Jensen?"** (defensive briefings, 2015 example), affair apology email, board committee, **finance bridge "where his story reaches your wallet"** (S&P 500 weight, retirement piggy bank, DeepSeek -$589B = $1,700 per American), upcoming earnings, ending at the empty chair, closing question, letter quote | `t0495`, `s31-s38` |

Chapter lengths: 3:50, 1:30, 1:16, 3:02, 1:30, 3:50, 0:50, 3:18. The long chapters are the ones with a personal story or an emotional turn. Each chapter card gets a near-silent audio dip of about 0.5-0.8 s (measured: 4:33.5, 7:18.7, 15:40.9, see J).

### B3. Retention devices, with timestamps

**Cliffhanger lines right before a chapter card** (each chapter ends on a hook):
- 4:27 "That made him the one man China needed most." → The Locked Door
- 5:58 "The key belonged to one man. And that man likes everybody." → The Cover
- 7:15 "So she went and found him." → The Approach
- 10:18 "Then we watch." → The Pipeline
- 11:48 "We make friends." → What She Was After
- 15:37 "By then, the people listening to her phone had a lot more than boxes." → The Memo
- 16:29 "...to climb aboard Air Force One on the way." → The Empty Chair

**Questions put to the viewer:** 0:36 "And who was watching?"; 11:52 "So what was all of this really for?"; 10:23 "So where did all those servers come from?"; 13:52 "Which one would you rather have a seat next to?"; 17:20 "Why did nobody tell Jensen?"; 19:35 "So who's pulling up a chair next to the people who build America's AI tonight?"

**"But / here's" turns:** 0:13 "But here's the strange part."; 0:44 "But to see why that call mattered, you need to know who picked it up."; 3:00 "And here's the trick that later made it a giant."; 9:51 "What almost nobody knew..."; 17:20 "But here's the part that still has no answer."; 18:24 "And here's where his story reaches your wallet."

**Set-up → payoff (foreshadowing):**
- 0:39 "It starts with a phone call from Washington" → 4:34 the call (3:55 later)
- 0:50 "He started in a bathroom in Kentucky" → 1:21 bathrooms
- 1:42 Huang Hall: "The boy who cleaned its bathrooms put his name on the front door"
- 8:06 "Nobody looks at those photos twice. **Later, someone will.**" → 10:18 the same photo on the analyst's screen (`c184`)
- 0:15 agents taking pictures → 15:43 the rainy surveillance car (same window, new angle)
- 1:56 "Dishes first" (Denny's) → 4:02 Jensen at 60 back at the sink: "Still remember how?" "Dishes first."

**Running phrases and running images:**
- "**We make friends.**" (handler) 5:57, 11:48, 19:29: the villain's motto, said three times
- "On paper..." 14:51-14:55 ("On paper, it was approved. On paper, Megaspeed looked fine too.")
- Whiteboard "BEST CHIPS: BLOCKED..." keeps being updated: 4:44, 4:48, 8:26, 12:08-12:20, 17:08, 18:48
- The handler / Alice two-desk shot-reverse-shot comes back as the "villain room": 5:42, 6:22, 11:36, 12:26, 13:42, 13:56, 19:28
- The Denny's set comes back in 4 eras: 1978 (1:52), 1993 (2:04), 2023 party (3:48), 7:22 / 7:28 callbacks

**Stakes and scale:** every big number is turned into something you can picture or into **dollars per American** (see F and M).

**Mini-scenes with dialogue every 20-60 s** turn exposition into drama (B6).

**Pattern breaks:** about every 15-25 s the viewer is hit with a black text card, a chapter card, a camera-flash white-out, a rewind, a whip-pan or a split screen.

### B4. Ending and call to action
- 19:16-19:20: Megaspeed company filing; a hand with a pink eraser rubs out "ALICE" (`t0579`, `c343`): "Her name has been taken off its company papers."
- 19:20: card "Nobody has said where she is."
- 19:22-19:24: **rewind montage** (◀◀ icon, VHS streaks) back through earlier scenes to the opening dinner (`t0581`, `c345-c347`): "Go back to that dinner in Singapore."
- 19:26-19:34: card "The chair next to Jensen is empty now." → the same restaurant, **empty red chair**, tag "~2 YEARS", Jensen alone raising his glass (`t0585-t0587`, `c350`)
- 19:29 the handler's motto one last time: "We make friends."
- 19:36-19:38: closing question card "So who's pulling up a chair next to the people who build America's AI tonight?"
- 19:40-19:46: Jensen at the end of the dark corridor → his desk → the email letter again: "I love our country and our company. I am proud and grateful to be an American." → US flag on a lit tower → final shot: **dark US map with glowing city lights** (`t0593`), mirroring the 0:02 map (bookend).
- **No spoken call to action**: no "subscribe", no "like", no channel plug in the narration or on screen. The video ends on a question and a quote. (Any end-screen would be a YouTube overlay added after upload and isn't in the file.)
- The **finance bridge comes at 18:24** (93% of the way through): "here's where his story reaches your wallet". For a finance channel this is the most reusable beat: a money story that lands on the viewer's own retirement account.

### B5. Story techniques worth noting
- **Starts in the middle (in medias res), flashes back, then catches up** to the opening scene at the end (dinner 0:00 → dinner 19:24).
- **Dramatic irony** carries the whole video: "Jensen has no idea" (0:20) → "He had no idea" (17:48).
- **Short sentences**, many 3-6 words; a fact is stated, then made concrete, then given a joke or picture.
- **Sources named out loud:** "According to the New York Times", "As his spokesman later put it", "Trade records later counted", "By Jensen's own account". Each gets a matching on-screen card (G).

### B6. Dramatised dialogue (voiced character lines)
About 120 of the 520 transcript lines are dialogue. Examples: 0:22 "To our customers!" / "To friends!"; 1:08 "Very strict." "Strict is good."; 1:37 "What's this say?" "I can teach you." "Then I teach you the bench press." "Deal."; 1:55 "Dishes first." "And then?" "Then busboy."; 2:22 "Anything else, boys?" "A graphics chip." "We have pancakes."; 2:51 "So how long have we got?" "30 days!"; 3:35 "One of everything, please." "Take a number!" "40,000?"; 4:37 the export-control phone call; 4:50 "How many chips do we need?"; 5:41-5:57 the handler briefing; 6:16 "We make phone games." "Now we make supercomputers."; 7:54 "Who haven't I met?" "Alice, Megaspeed, Singapore."; 8:12 "What do we put up as collateral?" "Everything."; 8:58 "From who?" "Refundable."; 9:19 "Where's the data center?" "You're standing in it." "These are boxes." "Very advanced boxes."; 10:05 "She's talking to an American citizen." "Then request the name." "It's Jensen Huang."; 10:33 "Inspur, you're on the list." "I'm Aivres, the American son."; 12:08 "Your China chip? Blocked." ... "I'm going to need a bigger whiteboard."; 14:29 "You're under arrest..." "Approved."; 17:08 "The spy memo's out!" "We're up 2.78%." "Up?"; 18:36 "Wait, I own NVIDIA?" "Everybody owns NVIDIA."; 18:51 "We just lost $589 billion." "How much is that?"

The dialogue is **lip-synced** (see C) and often lands as a **joke** that releases tension.

---

## C. Characters

### C1. One drawing system for everyone
All characters, real or generic, are built from one template (full-size check: `full/f_6.5.png`, `f_116.png`, `f_1131.png`):
- **Head:** a large perfect circle, about 1/3 of body height, with a **thick dark outline** (~4 px at 720p, near-black brown). No ears (except on a few CUs), **no nose**, no neck: the head sits right on the body.
- **Skin:** flat base colour (peach / tan / light brown / dark brown range) with a **soft radial gradient** and a lighter rim on the side facing the light. Heads take on the scene's light colour: green in the listening room (`t0302`), blue moonlight (`t0287`), warm candle glow (`t0011`).
- **Eyes:** tiny black dots or short arcs (happy closed eyes "^ ^"), short stroke eyebrows that carry the emotion. Sunglasses or rectangular glasses replace eyes for signature characters.
- **Mouth:** simple shapes: flat line, small "o", open D-shape with a red tongue, wide grin, frown.
- **Body:** a rounded bean / bell / egg shape filled with the outfit colour (jacket, dress, uniform, hi-vis vest); tie and lanyard are simple flat shapes.
- **Limbs:** **single black lines** (stick arms and legs) with small mitten hands; feet barely shown. In close-ups of hands (top-down desk shots), arms become **sleeve shapes** with drawn hands (`t0192`, `c104`).
- **Hair:** one solid shape with a few interior strokes (Jensen's grey swept hair, Alice's black bob with bangs).
- **Shadow:** a soft oval contact shadow on the floor; scenes have a vignette and focused light pools.

### C2. Cast list (real-person caricatures)

| Character | How drawn | Signature items and costume changes | Where |
|---|---|---|---|
| **Jensen Huang** | Peach round head, swept **grey hair** with spiky side strands, thin rectangular wire glasses, short brows | **Black leather jacket** (black body) + small green chip-eye pin. Other versions: **child** (black bowl cut, blue shirt, mopping, 1:20); **teen** dishwasher with folded paper hat that falls over his eyes (1:56, `full/f_116.png`); **showman** top hat + bow tie on a red-curtain stage (3:00); **apron with 10 plates** stacked up his arm (3:56); **gold key** on a chain (4:20-4:22) | Almost every chapter; 0:06, 1:26, 3:00, 3:56, 4:22, 5:04-5:14, 7:24, 9:44, 12:46-13:46, 17:46, 18:00, 19:30 |
| **Alice Huang** | Peach round head, **black bob with straight bangs**, **black sunglasses always** (even indoors at night) | Red dress with white collar (dinner); black blazer + red top (office, 6:14 on); nameplate "MANAGING DIRECTOR ALICE HUANG" | 0:00, 5:46, 6:14-6:42, 7:00, 7:50-8:02, 8:18, 11:26, 14:56, newspaper photo 16:36 |
| **The MSS handler** (generic officer) | Black side-parted hair, white shirt, dark tie; almost always **lit from one side** (half the face in shadow) | Green-blotter desk, lamp, polaroids, ledger with "账"; wall map with red pins and string | 5:42-5:58, 6:22-6:40, 11:36-11:48, 12:30, 13:42, 14:02, 19:28 |
| Chris Malachowsky / Curtis Priem | Beard + glasses + brown jacket; second in green | Lower third "CHRIS MALACHOWSKY" | 2:10-2:26 |
| John Rizzo (spokesman) | Generic suited man at an NVIDIA podium | Lower third "JOHN RIZZO / NVIDIA SPOKESMAN" | 7:32-7:36 |
| Sen. Tom Cotton | Brown hair, suit, podium with seal | Lower third "U.S. SENATE / SEN. TOM COTTON" (dark red); whiteboard "WHO OWNS IT?" | 15:06-15:14 |
| Marco Rubio | Dark hair, suit, big desk, sunset window | Lower third "SECRETARY OF STATE / MARCO RUBIO" (navy + red bar) | 16:00 |
| President (Trump caricature) | **Blond swept hair**, suit, Oval Office desk | Signing papers; asleep on Air Force One | 16:16-16:24 |
| Chinese MFA spokesperson | Black hair, glasses, podium, red flag with star | Tag "BEIJING" | 16:52-16:54 |
| Three congressmen | Light-skinned / Black / light-skinned men in suits | Calendar NOV 17 → 18, "CLOSED-DOOR BRIEFING" | 16:56-17:04 |
| 2015 congressman + FBI agent | White hair; agent in black with badge | Palm-tree window, "2015" sticky | 17:28-17:36 |

### C3. Generic characters
Kid brother, parents (1:00); school official in brown coat (1:08); **bully roommate**: big body, bandage on face, tattoo-covered arms with skulls and hearts (1:28-1:42, `full/v_101.5.jpg`); kids crowd (1:36); old man receiving a giant cheque (1:44); Denny's manager with moustache, red tie and badge (1:56); **waitress** (red hair, yellow uniform, 2:22); engineer at a green-screen PC (2:54); **chef** + an army of tiny chefs (3:06-3:14); scientists peeking in (3:20); purple-shirt customer (3:36); Chinese official on a stepladder (4:24); Washington official on the phone (4:38); **Nvidia sales exec** with headset, glasses, laptop with a **leaf logo** (parody brand), palm tree + cactus office (4:38, 12:08, 18:48); **Nvidia staffer** with green tie, lanyard, curly hair (8:26, 17:08); warehouse official with clipboard (4:52); gamer employee with headset and sweat drop (6:16-6:20); webcam client in blue shirt + orange tie (7:02); accountant with glasses and calculator (7:04, 10:42, head on fire); banker (8:12); dockworkers in hard hat and hi-vis (8:30-8:40); Commerce inspector with flashlight (9:20); grinning warehouse worker (9:24); auditors in green vests (9:38); interviewer (9:44); **intelligence analysts** with headsets + boss (10:02-10:16); bouncer at the "AMERICA" club (10:34); Malaysian rep in a yellow "MALAYSIA" shirt (10:52); customs officers (11:14, 14:26); prosecutor at podium (11:18, 14:22); export official **eating a burger** (14:36); NYT reporter with press badge (14:40); Bloomberg reporter (16:44); board directors (18:10); Wall Street traders (18:47).

**Objects as characters (with faces and stick limbs):**
- Chips racing on a running track, one with a US flag, one with a Chinese flag (5:12-5:14)
- **Server racks**: small "AIVRES" rack with sunglasses and US flag; giant "INSPUR" rack that turns red with a star and the label "PARTY STATE-OWNED"; it bends over to peek into the club (10:26-10:40)

**Diversity:** skin tones range from very light to dark brown in every crowd (Denny's party 3:56, high street 12:38, NVIDIA queue 7:20).

### C4. Expressions used
Big laugh with eyes shut (0:06), gentle smile, "o" surprise (0:24, 16:58), side-eye smirk (4:26, handler 11:42), frown/scowl (bully 1:32), worry with a **sweat drop** (6:20, 18:36), shock with a red flash on the screen (18:52), facepalm (12:20), smug (Alice 13:58), sleeping (16:24), sheepish (dishwasher hat 1:56), quiet and alone at the candle-lit table (17:46).

### C5. How they move
Checked at 10 fps in `motion1.jpg` and `motion2.jpg`:
- **Lip-sync: yes.** Mouths cycle through about 4-6 shapes (closed, small o, mid-open, wide open, grin) changing about every 0.1 s in time with the voice: Jensen 0:22-0:24, Alice 5:45-5:47.
- **Head motion:** small tilts and bobs, chin up and down on emphasis; Alice's head rotates a few degrees while talking.
- **Arms:** puppet-rig style rotation (wine glass raised 0:22; pointing 1:08; hand waves 4:26; typing hands 18:02).
- **Pose swaps** between shots, not full-body acting; walks are a simple bob plus slide (1:52 teen walks in, 10:40 rack waddles).
- **Blinks:** none clearly seen in the 10 fps samples. Eyes mostly change on expression swaps. Treat blinking as rare or absent.
- **Secondary motion:** steam puffs (1:56), swinging hanging bulb (1:40), flickering candles, rain, bobbing balloons.
- **On screen at once:** usually **1-3** main characters; crowds of 10-40 small characters for scale (3:56, 7:36 photo wall, 12:38 street, 16:52 press crowd); foreground backs-of-heads silhouettes give depth (2:48 staff, 4:22, 11:18).

---

## D. Props and objects

**Information props (the "paper" layer):** corkboard with red string (0:18, 15:42), polaroids (0:17, 5:44, 7:50, 13:52, 17:54), TOP SECRET folder (0:40), "OUR RULES" sheet (1:08), whiteboard with "?" (1:36), "NO RUNNING / LIGHTS OUT 9PM / CHORES LIST" board (1:34), POW! sticky (1:42), **giant cheque** "$122,848 → $2,000,000" (1:44), "BUSBOY" / "WAITER" sticky tags (1:58-2:00), napkin chip sketch (2:16), "BOTTOMLESS COFFEE 49¢" sign (2:18), pancake menu (2:24), order pad (2:23), banner "OUR COMPANY IS 30 DAYS FROM GOING OUT OF BUSINESS" (2:50), **tear-off "DAYS LEFT" calendar** 30 → 29 (2:54-2:56), take-a-number ticket "YOUR NUMBER 40,000" (3:38), plaque "THE BOOTH THAT LAUNCHED A $1 TRILLION COMPANY" (3:52-3:54), clipboard "CHIPS 10,000 / EACH $30,000 / CAN BUY:" (4:52-5:00), "WHO CAN BUY" paper (5:20), file card "FILE NO. K-417 / ALICE HUANG / RECRUITED:" (5:34-5:36), "NVIDIA PURCHASE ORDER" (5:54), clipboard "COVER STORY" checklist (6:24-6:32), "PER HOUR" key tag (6:42), "KEYS - BY THE HOUR" board (6:50), ledger "MEGASPEED 31 DEC 2023 EVERYTHING WE OWN ... TOTAL $33,000,000" (7:04-7:10), planner "JENSEN'S WEEK / FULL. AGAIN." with a "MEGASPEED" sticky (7:12-7:14), "EVENTS 2024" sticky (8:04), "LOAN APPLICATION ... COLLATERAL: EVERYTHING" (8:12-8:22), "COLLATERAL" stickies slapped on every desk (8:20), unrolling order receipt (8:28), "$2B ÷ $30,000 ≈ 60,000 CHIPS" sheet (8:38-8:40), invoices "TO MALAYSIA / TO SINGAPORE" (9:34-9:36), clipboard with ticks (9:42), "BLACKLIST: HUAWEI, INSPUR, SMIC, HIKVISION, SENSETIME" (10:38), bouncer's list (10:34), unrolling receipt down a library aisle (11:02-11:06), "PAID" stamp (11:28), "COST | RETURN" ledger (11:30-11:36), "NVIDIA STATEMENT" note cards (11:58, 15:20), signposts "CHINA CAN BUY / CAN'T BUY" (12:04-12:06), redrawn newspapers (12:22-12:32, 14:00, 15:16, 16:36), "SECRET MEMORANDUM" with red pen notes (14:08-14:12, 16:02), "APPROVED" signs (14:14-14:20), "EXPORT LICENCE NEW MATRIX BEIJING" + APPROVED stamp (14:36-14:38), "PRESS / THE NEW YORK TIMES" badge (14:40), "17 MONTHS OLD" sticky (14:42), "ORDER $3.2B" sheet blowing into the bin (14:56-15:04), "TO COMMERCE RE: MEGASPEED OCT 2025" letter (15:10), "REPORT" with "JENSEN HUANG" circled (17:42), spiral notepad "NORMAL / NO LONGER" (16:50), Megaspeed company filing with eraser (19:18).

**Money props:** green chip (glowing, recurring: 0:00, 0:26, 4:20, 13:45 with a "$30,000" price tag), cash stacks "$200" x3 → "$600" (2:28-2:32), cash tower erupting through the ceiling (4:12-4:14), cash register "$0" glowing green vs grey rivals (3:42-3:46), plates of cash with flags at a banquet table (13:14), money-bill unit grids (3:46, 18:26-18:30), **pink piggy bank "RETIREMENT"** that cracks open like a pie (18:32-18:34), lemonade stands "$33" vs "$3,000" crate tower (9:02-9:08), used couch with a "$600" price tag (2:34), green pie on a plate "95%" (5:04-5:06), balance scale chip vs car (4:58), balance scale on the dinner table (11:54).

**Tech props:** rotary phones (black 0:38; **red phone** for Washington 4:38, 12:44, 12:54), laptops with a **leaf logo** (parody, no real Apple logo), CRT TV with arcade game (3:16), green-screen PCs, server racks, tape recorder (15:42), camcorder REC UI (15:46), telephoto camera (0:16, 15:43), phone with social post (13:30), email window with SEND button (18:02).

**Setting props:** stepladders (4:24, 6:16), mop + bucket (1:20), hanging bulb (1:40), bunk beds + lockers (1:28), suitcases (1:04), balloons (3:48), handcuffs (11:18, 14:26), lobsters (11:14, 11:26), burger (14:36, 14:54), magnifying glass (1:11, 4:44, 5:02, 18:16), stopwatch (5:12), padlock (5:16, 9:46), plug and cable (15:28), printing-press rollers (16:32), red velvet rope + museum case "NVIDIA CHIP DESIGN" (11:56), golden key (4:20, 5:58).

**Props with faces:** chips (5:12), server racks (10:26-10:40). Everything else is faceless; personality comes from glow and motion.

**How props animate:** slide in from off-frame (papers onto the desk), **stamp slam** (CHINA 0:34, MSS 5:26, PAID 11:28, APPROVED 14:38), **write-on** handwriting (whiteboard 4:44, memo red pen 14:10, ledger 11:34), pop and scale-in (polaroids 0:17), **grow and stack** (plate stack 1:56, cash tower 4:12, chip tower 7:24, Taipei 101 floors 7:42), **tear-off** (calendar 2:56), page flip (ledger 7:06, calendar 2:04), unroll (receipts 8:28, 11:02), shake/vibrate with ring arcs (phones 0:38, 12:44), glow pulse (chips), smoke puffs (MSS building 5:30), head on fire (10:44).

---

## E. Backgrounds and settings

| Setting | Times | Palette, light and detail |
|---|---|---|
| Singapore fine-dining restaurant | 0:00-0:35, 11:52, 19:24-19:34 | Deep red velvet chairs, warm candle light, wood panels, wall sconces, window with blue night city + **bokeh** circles. Warm amber + crimson |
| Night map (Americas / US) | 0:02, 4:36, 16:14, 19:46 | Dark navy land/sea, glowing points and pillars, dotted flight arcs |
| Hotel exterior in rain | 0:13-0:14 | Dark purple, rain streaks, lit windows |
| Surveillance room / car | 0:16, 15:43 | Near-black with a single warm window; rain; foreground lens |
| Washington desk (Capitol window) | 0:38-0:46, 4:38, 12:08 | Dark teal / green desk blotter, green banker's lamp, rotary phone, Capitol dome lit outside |
| Santa Clara tower at night | 0:44, 19:44 | Grid of mint / cream windows, moon, stars |
| Balcony over city | 0:48, 13:46 | Night skyline, searchlights |
| **Parchment / "paper" map** (Taiwan, Pacific, SE Asia, world) | 0:54-0:58, 6:08, 9:32-9:36 | Beige land, pale blue sea, puffy white clouds, thin coastline outline. China region filled **red** when it matters (6:08, 18:40) |
| Taiwan family home | 1:00 | Warm orange, sunset window, sofa, TV |
| Kentucky porch at sunset | 1:04-1:10 | Pink-orange sky, white clapboard, porch swing |
| Kitchen / farm | 1:16-1:18 | Yellow polka-dot wallpaper; bright corn field, red barn, sun |
| School bathroom | 1:20-1:24 | Teal stalls, tiled floor, cold fluorescent light, deep one-point perspective |
| Interview studio "ON AIR" | 1:26, 9:44 | Dark purple wall panels, red neon, mic |
| Reform school dorm and hallway | 1:28-1:42 | Pale green walls, bunk beds, blue lockers, single bulb |
| School exterior | 1:44-1:46 | Bright daylight, red brick, green grass, white sky (high key) |
| **Denny's** (4 eras) | 1:52 (orange 1978), 2:04 (teal 1993), 2:10-2:26 (night booth, street signs BERRYESSA RD / EAST SAN JOSE), 3:48-4:00 (bright 2023 with balloons), 7:28 | Checkerboard floor, chalkboard "COFFEE · PIE", clock, wall calendar shows the year. **The same set re-lit per era** |
| Denny's kitchen | 1:56-2:02, 4:02, 7:22 | White tile, grey steel sink, bubbles, plate stacks |
| Startup office 1997 | 2:38-2:56 | Dark navy-grey, green CRT glow, boxes, bookshelves |
| Shipping floor | 2:58 | Conveyor, boxes, truck, night |
| Red-curtain stage | 3:00-3:10 | Spotlight cone, gold edges |
| Kid's bedroom | 3:16-3:24 | Deep blue night, CRT glow, posters |
| **Data centre aisles** | 3:26-3:30, 9:38-9:42, 10:22 | Navy racks, cyan LEDs, everything turns **Nvidia green** as chips "switch on" |
| NVIDIA shop counter | 3:36-3:40 | Shelves of green boxes, red LED "NOW SERVING" |
| Street queue outside NVIDIA storefront | 3:31 | Evening street, neighbours LAUNDRY / PHARMACY |
| Green void "money table" | 3:42-3:46, 13:45, 18:26-18:30 | **Green felt** spotlight with a vignette: a "stage" for numbers |
| Capitol at sunset / day / snow | 4:22, 12:04, 14:14-14:20, 19:08 | Pink-purple sunset glow with US flags; snowy blue winter |
| Dark official rooms (warehouse aisle of shelves) | 4:52-5:02 | Cold blue overhead tube lights, deep perspective |
| Light-blue meeting room | 5:20 | Pale blue, blinds, high key |
| MSS building at night | 5:24-5:30 | Dark streetlamps, columns, label sign; FBI building alongside |
| Filing cabinet wall | 5:34 | Grey-blue drawers, map |
| **Handler's office / Alice's office** | 5:42+ (recurring) | Grey-brown walls, door "0417", calligraphy scroll, green desk, lamp pool, blinds with night city, wall map with red pins. Split lighting |
| Top-down **green desk** | 5:44, 5:54, 6:24-6:30, 11:30, 12:22-12:32, 13:52, 14:06-14:12 | Green felt blotter, rotary phone, lamp edge, pen, coffee ring: the "investigation desk" |
| Chinese gaming office (7Road) | 6:04 | Navy, colourful monitors, yellow cat mascot |
| Megaspeed Singapore office | 6:14-6:20, 7:00 | Grey interior + **sunset-orange city window** |
| Car-dealer analogy | 6:44-6:50 | Bright cartoon field, picket fence, 3-panel split |
| Dark server room with data stream | 6:52-6:56 | Black + glowing green ribbon flying out of the window |
| Megaspeed accountant desk | 7:04-7:10 | Warm wood desk, green lamp, night city |
| NVIDIA HQ entrance | 7:20 | Night, glowing sign, palm trees |
| Press wall | 7:32-7:36 | Navy curtain, photos multiplying |
| Taipei skyline | 7:40-7:42, 13:00 | Night with moon / sunset purple; Taipei 101 builds floor by floor |
| Computex hall | 7:44 | Dark hall, coloured booth screens |
| Whiskey street + bar | 7:46-8:02 | Neon (WHISKEY, KTV, NOODLE, HOTEL), rain, glowing shelves of bottles |
| Kuala Lumpur tower + Megaspeed Malaysia office | 8:08-8:22, 8:46-8:56 | Navy night, twin towers outside, desk lamp pool, flipchart |
| Nvidia sales office (palm/cactus) | 8:26, 12:08-12:20, 17:08-17:14, 18:36, 18:48-18:58 | Bright cream/sand, glass walls, sunny desert view: the "daylight" counterweight to the dark villain rooms |
| Container port | 8:30-8:44 | Night, coloured containers, aerial grid |
| Lemonade street | 9:02-9:08 | Bright suburban, sun, picket fence |
| Malaysian warehouse | 9:10-9:30 | Pitch dark, flashlight cone, endless stacked boxes |
| **NSA-style listening room** | 9:56-10:18, 15:34-15:42 | Dark green, terminal screens, waveforms, desk lamps, corkboard |
| Aivres warehouse / "AMERICA" club street | 10:26-10:40 | Dusky street, red neon, red rope |
| Library aisle | 11:00-11:06 | Endless coloured book spines, one-point perspective |
| DOJ press room | 11:18-11:22, 14:22-14:24 | Navy curtain, big gold seal |
| Bright office Q2 SALES | 11:26-11:28 | High-key white |
| High street | 12:38-12:42 | HARDWARE / BARBER / BAKERY, bunting |
| Hearing room, commencement, keynote, Computex press, earnings-call grid, London stage | 12:50-13:24 | Seals, flags, coloured mics, video tiles |
| Banquet table to the horizon | 13:14-13:18 | Sunset, long white table |
| Hardware store "SUPPLIES FOR THE WHOLE WORLD" | 13:38-13:40 | Warm yellow, pegboard tools |
| Castle walls / gate "CHINA MARKET $50B" | 13:48-13:50 | Night stone towers |
| Customs office, export office | 14:26-14:38 | Pale teal; brown |
| Abandoned office (New Matrix) | 14:40-14:52 | Black, flashlight beam, dangling wires |
| Senate room | 15:06-15:14 | Crimson curtain, seal |
| Power room | 15:24-15:30 | Teal concrete, yellow floor line |
| Camcorder street (Taipei) | 15:46-15:52 | HOUSE / KARAOKE storefronts with REC overlay |
| Oval-office style, meeting rooms, Air Force One, Alaska tarmac | 15:58-16:28 | Gold curtains; snow and mountains |
| Printing press | 16:32 | Teal machinery |
| Wall Street trading floor | 18:47 | **Red-tinted**, fake tickers "GRID / HALO / IKON / JOLT", flying papers |
| Board room with giant eye logo | 18:10-18:20 | Dark wood, green screen |
| Bright white minimal room | 18:22 | Pure white set used once for a new "clean" scene |

**Depth and camera space:** 2.5D multiplane: foreground silhouettes (heads, lenses, plants), midground characters, soft-blurred backgrounds, **rack focus** used as a transition (1:34, 2:52, 7:30, 11:24). One-point perspective corridors are a signature shot (bathroom 1:22, data centre 3:26, warehouse 4:52, library 11:00, dark hallway 17:38, 19:40). Some sets have a **real 3D camera move** (the data-stream ribbon 6:56, container aerial 8:42, the Taipei 101 build 7:42).

**Day/night split:** about 70% of the video is **night or dark interiors**, which suits a spy story. The bright scenes are used for childhood, analogies (lemonade, car dealer), the Nvidia sales office and the finance bridge. For a finance channel the ratio should flip to mostly bright (see M).

**Texture:** none. Smooth gradients, glow and bloom; vignette on almost every frame; light cones from lamps.

---

## F. Graphs and data visuals

| # | Time | Type | Look | How it animates | Number labelling | Evidence |
|---|---|---|---|---|---|---|
| 1 | 0:02, 19:46 | Night map with glowing pillars / city dots | Navy, glowing white/green | Pillars rise, dots twinkle | none | `t0001`, `t0593` |
| 2 | 0:54-0:58, 6:08-6:10, 9:32-9:36, 18:40 | Parchment map + pin + dotted arc | Beige/blue, red pins, white dotted line | Pin drops, arc draws, boxes slide across borders, China fills red | Small handwritten labels "TAIWAN", "OUTSIDE CHINA" tag, "SINGAPORE" | `t0027-t0029`, `t0184`, `t0286` |
| 3 | 1:22-1:24 | Counter card | White rounded card | Rolls 89 → 100 | "100 BOYS" handwritten | `t0041-t0042` |
| 4 | 1:43-1:46 | Giant cheque | White cheque, green | Amount rolls $0 → $122,848 → $2,000,000 | Handwritten $ | `c039`, `t0052-t0053` |
| 5 | 2:28-2:34 | Cash sum on a table | Cream paper background, green bills | 3 stacks thrown in, labels "$200" each → merge "$600" → **split screen** with a used couch "$600" | Gold handwritten "$600" | `t0075-t0077` |
| 6 | 2:54-2:56 | Tear-off countdown calendar | White pad, red header "DAYS LEFT" | Page tears off 30 → 29 | Big handwritten number in a red circle | `t0087-t0088` |
| 7 | 2:58 | Unit counter over a conveyor | White handwritten | Rolls up "372,937" | | `t0089` |
| 8 | 3:06-3:14 | **Split-screen analogy chart** (CPU vs GPU) | Chef left; chip right "×1" → "×9,862" with the chip face filling with a grid of cores; then one chef vs a grid of hundreds of tiny chefs | Counter rolls, grid fills | "×9,862" green | `t0093-t0097` |
| 9 | 3:26-3:30 | Lights-on counter | Racks turn green row by row | Rolls "7,800 → 9,832 NVIDIA CHIPS" | White handwritten bottom-right | `t0105`, `full/v_210.jpg` |
| 10 | 3:36-3:40 | Queue number | Red LED "NOW SERVING 12 → 13", ticket "40,000" | Ticket flies to camera | | `t0108-t0110` |
| 11 | 3:42-3:46 | **Market share as cash registers + unit grid** | Glowing green register "$0" vs grey rivals, "2025" sticky, grid of bills fills a box | Grid fills | "86 OF EVERY $100" handwritten green/white | `t0111-t0113` |
| 12 | 4:00 | Counter | "10 PLATES" | | | `t0120` |
| 13 | 4:10-4:14 | **Growth tower** | Cash tower in the booth bursting through the ceiling with a paper-rip edge | Grows and breaks the ceiling (debris, smoke) | Green chalkboard box "$1 FROM EVERY $1" → "$29M" → "$4K" → "**$8 BILLION FROM EVERY $1**" | `t0125-t0127`, `c074-c075` |
| 14 | 4:44-4:50 | Handwritten whiteboard list | White board, blue marker, red cross-outs, green additions, small pie-clock icon | Write-on, circling, strike-through | "$17B / YEAR", "13% OF EVERYTHING" | `t0142-t0145` |
| 15 | 4:58 | Balance scale | Gold scale, chip vs car | Tips | "ONE CHIP = 1 CAR" | `t0149` |
| 16 | 5:04-5:06 | Pie chart as a real pie | Green pie on a plate; slice tag "95%" | Slice lifted out | Yellow tag | `t0152-t0153` |
| 17 | 5:12-5:14 | Race track | Chips with flags running | Run | "NANOSECONDS" label | `t0156-t0157` |
| 18 | 7:10 | Ledger total | Cream ledger | Write-on | "$33,000,000" red, circled | `t0215` |
| 19 | 7:12-7:14 | Calendar/planner as data | Hourly rows with coloured icons | A sticky slides into a slot | "FULL. AGAIN." | `t0216-t0217` |
| 20 | 7:24-7:26 | Glowing chip tower | Neon green column | Builds up | "$4.5T TRILLION" | `t0222-t0223` |
| 21 | 7:32-7:36 | Photo wall multiplying (unit chart) | Polaroids fill the screen | Multiplies | "1,000s" yellow | `t0226-t0228` |
| 22 | 7:42 | Building-floor build | Taipei 101 floors pop in | Stacks up | | `t0231` |
| 23 | 8:29 | Shipment sign counter | Black sign | 99 → 100 → 150 → 200 | | `c167`, `t0255` |
| 24 | 8:36-8:40 | Handwritten maths on paper | White sheet, blue ink | Write-on line by line | "$2B ÷ $30,000 ≈ 60,000 CHIPS" | `t0258-t0260` |
| 25 | 8:42-8:44 | Aerial unit grid (containers) | Coloured blocks to the horizon | Counter "53,221 → 60,000", "2024" sticky | | `t0261-t0262` |
| 26 | 8:46-9:00 | **Bar chart** (flipchart → full screen on lined paper) | Green bars, hatched yellow overlay | END 2023 tiny "$33M" bar; END 2024 bar shoots off the top; hatched part tagged "$2.9B DEPOSITS"; calculator "100,000,000"; red box stamp "**×90**" | Handwritten | `t0263-t0270`, `c173-c174` |
| 27 | 9:02-9:08 | Analogy bar chart | Lemonade "$33" vs crate tower "$3,000" | Tower grows | | `t0271-t0274` |
| 28 | 10:02-10:16 | Intelligence UI | Green terminal, waveforms "FOREIGN TARGET" / "US PERSON" with flag, typed fields, button | Typing, waveform motion, screen flips to white report | "TARGET: ALICE HUANG / ON THE LINE WITH: [AN AMERICAN CITIZEN]" → "JENSEN HUANG"; call log list | `t0301-t0308` |
| 29 | 10:42-10:50 | Stacked-boxes growth | Boxes pile around a desk | Counter "$3.9B → $4.6B OF EQUIPMENT", "$4.0B FROM AIVRES"; date range "DEC 2024 → JAN 2026" | Gold handwritten | `t0321-t0325` |
| 30 | 11:02-11:06 | Receipt unrolling down an aisle | Glowing paper strip | Unrolls | "$4.7B → $4.8B NVIDIA INSIDE" | `t0331-t0333` |
| 31 | 11:22 | Seized pile + tag | Green boxes, handcuffs | Tag "$?" → "$160M" | Red tag | `t0341` |
| 32 | 11:30-11:36 | Two-column ledger (cost vs return) | Cream ledger on a green desk | Write-on | "DINNERS / WHISKEY" vs "$4.8 BILLION AI GEAR" | `t0345-t0348` |
| 33 | 12:08-12:20 | Policy whiplash on a whiteboard | Crossed out "H20 BLOCKED", "15%", "25%", "DEC: YES?? 25%", "$200?", "???" | Scribbles pile up | | `t0364-t0370` |
| 34 | 12:36 | Blocked inventory | Green pallets behind red BLOCKED tape | | "$4.5B" | `t0378` |
| 35 | 12:40-12:42 | Per-person cost | High street people, a hand gives each "$13 EACH" | Sticky | | `t0380-t0381` |
| 36 | 13:08-13:12 | Shopfront as market | "CHINA MARKET $50B" shop; shutter rolls down "CLOSED TO U.S. INDUSTRY" | Shutter animation | | `t0394-t0396` |
| 37 | 13:14-13:18 | Per-person cost | Banquet table with cash plates | Sticky "$150 EACH" | | `t0397-t0399` |
| 38 | 13:20-13:24 | Race graphic on a stage screen | "THE AI RACE" USA vs CHINA runners | | | `t0400-t0402` |
| 39 | 16:42 | **Stock line chart** | Dark screen, white line turns red and dives | Line draws, drops | "NVDA -3.00%", red tag "-3%", "OCT 29" | `t0501`, `c292` |
| 40 | 17:12 | Stock line chart | Green screen, green line up | Line draws | "NVDA +0.18% → +1.48%", "NOV 6" | `t0516`, `c303` |
| 41 | 18:26-18:30 | **Index-fund unit chart** | Green felt, 100 bills in a grid, sign "S&P 500 INDEX FUND"; 8 bills highlighted | Counter 5 → 100, highlights | "$8 OF EVERY $100" | `t0553-t0555` |
| 42 | 18:32-18:34 | Piggy bank as a pie | Pink "RETIREMENT" pig cracks into a pie with a slice | Coin drops, crack | | `t0556-t0557` |
| 43 | 18:52 | Loss counter | Laptop flashes red; whiteboard counter rolls up | "-$485B ... -$589B" red handwritten | | `full/v_1132.5.jpg`, `t0566` |
| 44 | 18:56-18:58 | Per-person cost | Whiteboard "$1,700" + a row of stick-figure icons | Icons draw on | | `t0568-t0569` |
| 45 | 19:06 | Calendar as timeline | Month grid with "17" circled + green "EARNINGS" tag | Circle draws | | `t0573` |

**Data rules seen:** (1) no axes or gridlines except on the two bar charts and stock lines; (2) every number is **handwritten** in the channel font, usually gold/yellow (money), green (Nvidia/gain), red (loss/danger), white (neutral); (3) numbers **roll up** like counters rather than appearing all at once; (4) charts live **inside the world** (whiteboards, flipcharts, ledgers, calendars, shop shutters, piles of objects) rather than as floating infographics; (5) every big number is followed by a **human-scale conversion** (per American, per car, per couch, lemonade stand).

---

## G. Official references and evidence

**The key finding: the video shows no real screenshots, photos, logos or documents at all. Every source is redrawn** in the cartoon style, in the same handwritten font, usually on a tilted paper card with a soft shadow.

| Time | Reference | How it is shown | Source credited on screen? |
|---|---|---|---|
| 0:18 | Intelligence corkboard (MSS) | Redrawn corkboard, red string, red "MSS" tab | No (narration) |
| 1:44 | Huang Hall donation | Giant cheque made out to the school ("PAY ONEIDA BAPTIST INST..."), amount rolling up | No |
| 3:52 | Denny's plaque | Redrawn gold plaque text, camera push-in | No |
| 4:44 | Export controls | Whiteboard list (not the actual rule text) | No |
| 5:24-5:30 | MSS building | Generic building with sign "MINISTRY OF STATE SECURITY"; red rubber stamp "MSS" | No |
| 5:34 | Alice's file | Fictional "FILE NO. K-417" card | No (narration admits the date is unknown) |
| 7:32 | Spokesman statement | Spoken quote + lower third "JOHN RIZZO / NVIDIA SPOKESMAN" | Yes, name tag |
| 7:50 | Whiskey-bar photos | Redrawn as a cartoon selfie that **flashes** into a polaroid with an orange date stamp "06 2024" | No |
| 9:44 | Jensen's "counted" quote | Interview scene with "● LIVE" badge, quote text "'COUNTED" handwritten, lower third "JENSEN HUANG / NVIDIA CEO" | Yes, name tag |
| 10:02-10:16 | Intelligence signals report | Fake green terminal UI "SIGNALS REPORT · TOP SECRET" | No |
| 11:58-12:00 | **Nvidia statement** | Note card with header "● NVIDIA STATEMENT", quote in handwriting; red circle on "zero", **yellow highlighter** on "information relevant to" | Yes, header |
| 12:22-12:32 | Policy news | Redrawn clippings "**THE DAILY WIRE**" (fictional name): "CHIP BLOCKED" (circled), "15% DEAL", "25% DEAL", with small dates | Fictional masthead |
| 13:02-13:04 | Computex quote | Press backdrop repeating "COMPUTEX 2025", lower third "JENSEN HUANG / COMPUTEX PRESS Q&A · 21 MAY 2025" | Yes, event + date |
| 13:06-13:12 | Earnings call quote | Fake video-call grid "NVIDIA EARNINGS CALL · 28 MAY 2025" with tiles FUND / BANK / ANALYST / PARTNER / WEALTH / CAPITAL / RESEARCH / HOLDINGS | Yes, event + date |
| 13:20 | London speech | Location tag "LONDON, NOV 2025" | Yes, place + date |
| 13:26-13:34 | **Social post** | Phone screen, green header "NVIDIA", avatar + name "Jensen Huang", post text typed on, yellow highlight on "racing ahead and winning" | Yes, name |
| 14:00 | Op-ed | Redrawn newspaper "THE DAILY LEDGER" (fictional): "LET AMERICAN CHIPS COMPETE" with a Jensen photo | Fictional masthead |
| 14:08-14:12, 16:02 | **The memo** | Paper "SECRET MEMORANDUM", grey placeholder lines, quoted sentence handwritten ("Recruited by China's Ministry of State Security."), **red underline** + red margin notes | Implied |
| 14:40-14:50 | NYT reporting on New Matrix | Reporter with a badge "PRESS / THE NEW YORK TIMES"; the **direct quote** "a hollow gray shell with wires dangling from the ceiling" floats as handwritten text with quote marks | Yes, badge |
| 15:06-15:14 | Sen. Cotton's letter | Letter prop "TO COMMERCE RE: MEGASPEED OCT 2025"; his quote "CHINESE GOVERNMENT-OWNED CLOUD COMPANY" written on a whiteboard | Yes, lower third |
| 15:16 | **NYT front page** | Redrawn front page with masthead in the handwritten font "THE NEW YORK TIMES", date "OCT 2025", price "$2.00", headline "$2 BILLION OF CHIPS, IN MALAYSIA", photo box | Yes, masthead |
| 15:20 | Nvidia statement 2 | Green header card "NVIDIA STATEMENT": 'Megaspeed had "no China shareholders."' + yellow highlight | Yes |
| 15:46-15:52 | Surveillance video | Camcorder overlay "REC", timecode "22:47:08:05", battery, "MAY 2025", focus brackets | No |
| 16:18-16:20 | Briefing of the President | Small white source tag top-left "**THE NEW YORK TIMES**" over the Oval Office scene | **Yes, source tag** |
| 16:36-16:40 | NYT story | Redrawn front page "OCT 29, 2026 · $4.00 · A SPY AT NVIDIA'S TABLE", Alice photo, headphones icon, "AMERICAN INTELLIGENCE **KNEW**" (red underline), red dashed line to a "BEIJING" map inset | Yes, masthead |
| 16:44 | Bloomberg interview | Tag "BLOOMBERG" top-left, reporter with mic | Yes, tag |
| 16:52 | Beijing response | Tag "BEIJING", podium with red flag | Yes, place |
| 17:00 | Congress letter | Big white letter with a blue seal held up by 3 congressmen | No |
| 18:02, 19:41 | Jensen's apology email | Email window "To: ALL STAFF" typed on, SEND → SENT | Implied |
| 19:18 | Company filing | "MEGASPEED COMPANY FILING · DIRECTORS · ALICE" erased | No |

**Brand handling:** NVIDIA's name and green "eye" are shown as redrawn simplified marks; Megaspeed and 7Road get **invented simple logos**; the laptop is a **leaf** logo; stock tickers on Wall Street are invented ("GRID", "HALO", "IKON", "JOLT"); newspapers other than NYT get **invented names** ("THE DAILY WIRE", "THE DAILY LEDGER"). Seals (DOJ, Senate, Oval Office) are **generic** shields and stars, not real ones.

**Emphasis toolkit for evidence:** tilt (5-10°), soft drop shadow, slow push-in, red circle (hand-drawn ellipse), red underline, yellow highlighter swipe, red rubber stamp slam, magnifying-glass loupe (4:44, 5:02, 18:16), paper clip holding a polaroid, red string between pins, eraser rub-out.

---

## H. Text on screen

**Font:** one casual **handwritten brush-marker font** everywhere (similar in feel to free Google fonts like *Caveat Brush*, *Kalam* or *Gochi Hand*): titles, labels, numbers, newspapers, UI. Monoline, slight slant, mixed case for sentences, ALL CAPS for labels.

| Text type | Look | Examples | How often |
|---|---|---|---|
| **Narration text cards** | Pure black screen, white handwritten sentence, left-aligned or centred; **words appear in sync with the voice** (typewriter); card holds the full sentence for a beat, then hard cut. Vertical position **varies** between upper third, centre and lower third, so consecutive cards don't sit in the same place | "having dinner with a Chinese spy" 0:04; "Jensen has no idea." 0:20; "He started in a bathroom in Kentucky." 0:52; "It was a reform school for troubled kids" 1:14; "Nvidia had about one month of payroll left" 2:44; "every AI company on Earth was standing in line" 3:34; "Two years later, Nvidia became the first company ever worth five trillion" 4:08; "What almost nobody knew was that American spies were already listening" 9:54; "It was the biggest one-day loss in market history." 19:02; "The chair next to Jensen is empty now." 19:28 | **~45 cards ≈ one every 26 s.** Always used for the **strongest sentence** of a section |
| **Chapter cards** | Black, white, larger, centred, Title Case | The Man With the Key, The Locked Door, The Cover, The Approach, The Pipeline, What She Was After, The Memo, The Empty Chair | 8 |
| **Title** | Over a live scene, white + one red word, left of frame | "HOW A CHINESE SPY GOT INSIDE NVIDIA" | 1 (0:40) |
| **Lower thirds (people)** | Dark see-through rounded rectangle with a **green vertical bar** on the left (Nvidia people) or **red** (government); name in caps, role smaller underneath; types on letter by letter | JENSEN HUANG (0:06; + NVIDIA CEO 9:44; + COMPUTEX PRESS Q&A · 21 MAY 2025, 13:04), CHRIS MALACHOWSKY (2:14), JOHN RIZZO / NVIDIA SPOKESMAN (7:32), U.S. SENATE / SEN. TOM COTTON (15:08), SECRETARY OF STATE / MARCO RUBIO (16:00) | 7 |
| **Place/time tags** | Small dark navy box or plain text, top-left or bottom-left, caps, often "PLACE · DATE" | SINGAPORE, SANTA CLARA, CALIF., KENTUCKY, YEARS LATER, DECADES LATER, OCT 2022, JUNE 2024 · TAIPEI, JUNE 2024 · MALAYSIA, LATE 2024 · MALAYSIA, DECEMBER 2025, TAIPEI MAY 2025, LONDON, NOV 2025, · MALAYSIA, ALASKA (huge), BLOOMBERG, BEIJING, OCT 29, 2026, JAN 2025 | ~23 |
| **Sticky-note tags** | Yellow (or green/red) tilted rectangle, handwritten | 2025, 2023, POW!, BUSBOY, WAITER, COLLATERAL, EVENTS 2024, MEGASPEED, 17 MONTHS OLD, LATER, +1 WEEK, +2 WEEKS, $13 EACH, $150 EACH, $2.9B DEPOSITS, 95% | ~25 |
| **In-world signs** | Neon, shop signs, banners, nameplates | DENNY'S, ON AIR, NVIDIA, KTV, NOODLE, HOTEL, WHISKEY, AMERICA, LAUNDRY, PHARMACY, BAKERY, BARBER, MEGASPEED, DATA HALL, CUSTOMS, SMUGGLING BUST, COMMENCEMENT, HEARING, CLOSED-DOOR BRIEFING, SUPPLIES FOR THE WHOLE WORLD | constant |
| **Numbers** | Large handwritten, coloured by meaning (gold money, green gain/Nvidia, red loss/danger) | $ BILLIONS, $600, 30 DAYS, ×9,862, $8 BILLION, $4.5T, $2 BILLION, ×90, -3%, -$589B, $1,700 | constant |
| **Quote text** | Handwritten floating text with quote marks, or on note cards | "a hollow gray shell with wires dangling from the ceiling" (14:48); "COUNTED" (9:44) | ~6 |
| **Subtitles/captions** | **None.** No running captions at all; only the black text cards | | 0 |

**Text density:** some text is on screen in almost every shot (labels, signs, stickies). Full sentences only appear on the black cards, notes and documents.

---

## I. Camera and editing

**Camera moves (inside shots):**
- **Slow push-in / drift** on nearly every shot (continuous ~2-5% scale over the shot): `motion1.jpg` shows a steady push-in plus pan during the toast.
- **Big push-ins** to a detail: plaque (3:52-3:54), corkboard, whiteboard, NYT page, the dark corridor (17:38-17:44, 19:40).
- **Pans** across wide sets (Denny's 1:52-1:54, high street 12:38-12:42).
- **Top-down (bird's-eye)** shots for tables and desks: dinner (0:32), fight (1:42), napkin (2:16), cash (2:28), cover-story desk (6:24), ledgers (11:30), clippings (12:22), meeting (16:10), rewind (19:23). This "investigator's desk" angle comes back ~15 times.
- **POV** shots: camera viewfinder (0:36), camcorder (15:46), phone camera (7:49), webcam (7:02), flashlight (9:20, 14:40).
- **Rack focus / defocus** as a scene change (1:34, 2:52, 7:30, 11:24, 11:52).
- **3D camera flights**: data-stream ribbon (6:52-6:56), containers aerial (8:42), Taipei 101 build (7:42), printing press (16:32).
- **Magnifier loupe** zooms (4:44, 5:02, 18:16).
- **Slight shake** on impacts (stamp slams, ring).

**Transitions (with examples):**

| Transition | Examples | Feel |
|---|---|---|
| Hard cut (most common) | throughout | Pace |
| **Cut to black text card and back** | ~45 times | Pause and emphasis |
| Whip-pan with motion blur | 0:08, 14:28, 19:12 (`c341`) | Energy, shift of attention |
| Camera-flash white-out | 7:50 (photo), 15:43-15:44 (shutter strobe) | Turns a moment into "evidence" |
| Rack focus / blur dissolve | 1:34, 2:52, 7:30, 11:24, 11:52 | Soft time jump |
| **Calendar flip / page tear** | 2:04 (1978 → 1993), 2:56 (30 → 29), 4:34 (AUG → OCT 2022), 16:58 (NOV 17 → 18), 18:42 (SEP → OCT 2026) | Time passes |
| Same set re-lit / re-dressed | Denny's 1978 → 1993 → 2023 | Time passes in one location |
| Split screen (vertical, sometimes jagged) | phone call 4:38-4:50 (split line turns to a **lightning crack** when the call ends), couch vs $600 (2:34-2:36), chef vs chip (3:06-3:14), lemonade (9:02-9:08), car dealer 3-panel (6:46-6:50), outside/inside window (10:52-10:58), Air Force One vs Jensen (16:24), office → library panel slide (11:00) | Comparison |
| Light-streak wipe | 3:31 into the NVIDIA queue | Big reveal |
| Paper rip through the ceiling | 4:14 | Scale overflow |
| Freeze into a photo | 7:50, 17:54 (scene becomes a tilted polaroid with a red circle) | Evidence |
| **Rewind** (◀◀, VHS streaks, scenes run backwards) | 19:22-19:24 | Bookend to the opening |
| Light sweep over a prop | 4:34 calendar | Polish |
| Shot / reverse shot between two locations | handler ↔ Alice (5:43-5:57, 11:36-11:48) | Fake conversation across distance |

**How a new scene is introduced:** (1) an establishing exterior or location tag with place + date (e.g. "JUNE 2024 · TAIPEI" over the skyline at 7:42, then Computex at 7:44); or (2) a black text card stating the next beat; or (3) a calendar flip. A scene **almost never starts static**: something is already moving (rain, lights, counter, camera).

**Rhythm:** 2-4 s per shot during exposition; 10-26 s **only** for suspense (warehouse, listening room, stage reveal). A black card roughly every 20-30 s resets attention.

---

## J. Sound

**Voice:**
- One main **narrator**: male-range voice (median pitch ~120-150 Hz on narration lines), calm, confident, documentary tone, **159 wpm** overall and **~188 wpm** while speaking. Very tight edit: pauses between sentences are usually only 0.2-0.5 s.
- **Character voices for the dialogue**: many lines measure clearly higher (~190-275 Hz, e.g. "To our customers!" 225 Hz, "What's this say?" 276 Hz, "Anything else, boys?" 200 Hz), which suggests separate voices or pitched-up character reads; some character lines sit in the narrator's range (e.g. "Very strict." 138 Hz), so the narrator may voice some of them. *(Measured from pitch only; the voices could not be told apart by ear in this study.)*
- Delivery tricks: one-word punch lines ("Was." 4:50, "Him." 12:32, "Up?" 17:15), quoted officials read in a slightly different, flatter "quote voice" (e.g. "All in all, the export control was a failure." 13:04).

**Music and mix:**
- **A music/ambience bed runs under the whole video**: there is no stretch quieter than -45 dB for even 0.4 s from start to end.
- **Near-silence used for effect only at section breaks:** below -32 dB just 4 times: 4:33.5-4:34.1 (after the "The Locked Door" card), 7:18.7-7:19.5 ("The Approach"), 15:40.9-15:41.7 ("The Memo"), and the last second 19:46.8-19:47.9. Chapter cards get a short drop-out, then a new music cue starts on the next scene.
- Mix: -14.3 LUFS integrated, **loudness range only 2.2 LU**: voice is kept at a constant level and the music sits well under it.

**Where the music sits (classifier "Music" score per 10 s window; 0 = none, 1 = strong; the full timeline is in `D:\HarryShorts\study\tagsummary.txt`):**

| Music level | Time ranges | What is on screen | What the music is doing |
|---|---|---|---|
| **Drops out** (≈0.0-0.1) | 0:15-0:30 | Agents photograph the dinner, toast, under-table handoff | Hook is played almost dry: voice + effects only, for tension |
| Swell (0.6-0.8) | 0:30-0:55 | Phone call from Washington → **title** → chapter 1 | Title sting and build |
| Steady warm (0.5-0.65) | 1:05-2:30 | Childhood, Kentucky, Denny's, founding | Light, nostalgic bed |
| **Low** (0.04-0.25) | 2:40-3:25 | 30 days from bankruptcy, stage reveal, chef analogy | Pulled back for the near-death beat and the explainer |
| Back up | 3:40-4:30 | AI boom, plaque, $5T, "key to AI" | Triumphant |
| **Low** | 4:35-4:45, 5:35-5:50 | Export-control call; handler briefs Alice | Tension: under-scored dialogue |
| Mid-high | 6:10-7:20 | Megaspeed cover story, renting analogy | Playful, scheming |
| Mid | 7:35-9:50 | Approach, whiskey bar, loans, shipments, inspector | Steady drive; **brass/trombone-like hits around 9:10-9:40** (comic "very advanced boxes" beat) |
| **Drops out** | 9:55-10:10 | The twist: US spies listening, unmasking "Jensen Huang" | Silence-like bed for the reveal |
| High | 10:15-10:25 | Chapter "The Pipeline" | New cue; **harmonica-like** colour 10:30-10:50 (Aivres / "AMERICA" club) |
| High (0.6-0.74) | 11:00-11:50 | $4.8B receipt, lobsters, cost/return → "We make friends." | Builds to the chapter end |
| **Low** | 12:15-12:25 | Whiteboard chaos ("bigger whiteboard") | Pulled back for the joke |
| **Drops out** | 13:15-13:30, 13:45-13:50 | London speech, Jensen's social post, "$30,000 a chip" | Quotes are read over near-silence |
| **Low** | 15:10-15:20 | Sen. Cotton, NYT front page, Nvidia statement | Sources read dry |
| **Drops out** | 15:55-16:15 | **The memo text** "Recruited by China's Ministry of State Security...", President briefed | The most serious sentence gets no music |
| High (0.62-0.66) | 16:20-16:45 | Air Force One → "The Empty Chair" → NYT printing press | Big new cue |
| **Low** | 17:30-17:40 | Dark corridor, "Nobody told the man at the table" | Low drone + **boom hits** |
| High | 18:10-18:40 | Board, wallet segment, piggy bank | Upbeat for the finance bridge |
| **Low** | 18:45-18:55 | DeepSeek crash, "-$589B", "$1,700 per American" | Pulled back for the shock number |
| Up to the end (0.5-0.68) | 19:00-19:47 | Earnings date, empty chair, closing question, letter | Ending theme |

**Rule seen:** music drops out for (a) reveals and twists, (b) direct quotes of officials and documents, and (c) shock numbers. It swells at the title, chapter starts and montages.

**Sound effects** (AudioSet classifier on 10 s windows, cross-checked against the picture; the classifier's labels are approximate, so the second column gives the likely real sound):

| Time (window) | Classifier label | Likely sound, matched to the picture |
|---|---|---|
| 0:30-0:50 | Telephone bell ringing / ringtone (0.54) | Rotary phone ringing on the Washington desk (0:38, ring arcs on screen) |
| 0:35 | Typing | Title / text typing on |
| 0:55-1:00 | "Chopping (food)" (0.61) | Hard knocks / thuds: map pin drop, flight path, suitcases |
| 1:05 | Zipper | Suitcases on the porch |
| 1:50, 2:05 | Chink, clink | Denny's dishes, cups |
| 1:55, 4:20, 10:45, 12:10-12:15 | Gasp / snort | Character reaction sounds (Denny's boss, "key to AI", accountant on fire, "bigger whiteboard") |
| 2:15-2:20 | Liquid / pour / drip (0.42) | Coffee poured in the Denny's booth |
| 3:00 | Mechanisms | Stage reveal of the chip (curtain / machinery) |
| 3:10-3:15 | "Chicken, rooster" (0.34) | Comic hits during the chef vs "10,000 line cooks" gag (possibly kitchen/cartoon sounds; uncertain) |
| 4:45-4:55 | Telephone ringing (0.58) | The export-control phone call ends (split screen cracks) |
| 5:25 | Spray | Smoke puffs at the MSS building |
| 5:40, 10:10-10:15, 12:20, 16:05, 17:10 | "Shuffling cards" (0.43) | **Paper sliding and shuffling** on the desk: files, polaroids, clippings, memo, newspaper. This is the signature "paper" sound of the video |
| 6:20-6:25, 13:55 | Whispering (0.55) | Whispered/hushed delivery in the handler's office scenes |
| 7:20 | Pour | Jensen pours coffee at Denny's (7:28) |
| 7:55-8:00 | Dishes, clink | Whiskey glasses at the bar |
| 8:20 | Typing | Pen signing "EVERYTHING" / calculator |
| 8:25, 9:00 | Camera shutter | Receipt printer / camera clicks |
| 9:10-9:40 | Brass, trombone | Comic brass stings in the music (warehouse "very advanced boxes") |
| 10:00 | "Beatboxing" | Glitchy/electronic UI blips in the listening room |
| 10:30-10:50 | Harmonica | Harmonica-like music colour for the "AMERICA" club / Aivres scene |
| 12:35-13:05 | Telephone ringing (0.42) | Red phone ringing (12:44 "AUG 2025"), hearing-room phone |
| 13:20 | Applause | London stage audience |
| 13:35-13:40, 15:00-15:05 | Single-lens reflex camera (0.75) | **Camera shutters**: phone post scene, and press cameras when Sen. Cotton is at the podium |
| 13:45 | "Chopping" | Thud as the chip with a "$30,000" tag lands on the felt |
| 14:35 | Mechanisms, gears | Rubber stamp "APPROVED" / machinery |
| 14:50-14:55, 16:15-16:25 | Telephone ringing | Phone rings: "Then, Trump called him" (16:24) |
| 15:35 | Timpani | Drum hit at the end of chapter 6 into "The Memo" |
| 17:25, 17:40 | "Artillery fire / gunshot" (0.30) | **Deep boom hits** in the dark corridor and when the report with "JENSEN HUANG" circled slams in |
| 17:35 | Door | Door in the 2015 briefing scene |
| 17:55-18:00 | "Sheep / bleat" | Unclear; possibly a stylised sound under the apology email (classifier noise likely) |
| 6:30, 8:30-8:35, 11:30 | "Dog / animal" | Unclear; low confidence (0.15-0.23), probably misread music or voice |
| 0:00, 0:25, 3:20, 5:25-5:30, 12:40-12:45, 17:45 | "Vehicle" | Low rumbles / risers / ambience under transitions |

**Effects seen on screen that clearly carry sound** (from the picture; the 10 s classifier windows are too coarse to time them exactly): whoosh on whip-pans (0:08, 14:28, 19:12), stamp slams (0:34, 5:26, 11:28, 14:38, 9:00 "×90"), camera-flash pops (7:50, 15:43), tear-off page (2:56), counters ticking, cash-register / money (3:42), glass clink (0:23), rain (0:13, 7:54, 15:44, 18:08), rewind tape (19:22), typing (lower thirds, email 18:02), plug pulled with sparks (15:28), container door creak with green glow (8:34), smoke puff (5:30), ceiling crash (4:14), ring arcs (0:38, 12:44).

---

## K. Recurring style rules (the channel's visual grammar)

1. **Same character template for everyone:** big circle head with a thick outline, dot/arc eyes, no nose, bean body, stick limbs. Real people get **one or two signature traits** (grey swept hair + glasses + black jacket; black bob + sunglasses + red).
2. **Colour has meaning:** green = Nvidia / chips / money gained; red = China / danger / loss / stamps; gold/yellow = money amounts and sticky notes; navy/teal = night and secrecy; warm amber = the personal story (dinners, Denny's).
3. **Every number is drawn, rolls up and gets a human-scale comparison.**
4. **Every source becomes a redrawn paper prop** (newspaper, note card, memo, social post, clipboard) with circle / underline / highlight / stamp.
5. **The black text card** for the punchiest sentence, words appearing with the voice, about every 26 s.
6. **Chapter cards** with short, intriguing 2-4 word titles; each chapter ends on a hook line.
7. **Top-down desk** as the investigation hub; papers slide in by hand.
8. **Location/date tags** for every jump in place or time; calendars for time passing.
9. **Dialogue mini-scenes** with lip-sync to dramatise facts; often end on a joke.
10. **Analogy scenes** in bright, simple sets (chef vs line cooks, couch, car per chip, car keys by the hour, lemonade stand, older cousin, banquet table).
11. **Recurring sets re-lit for new eras** (Denny's ×4, the handler's office, the Nvidia sales office whiteboard, the Washington desk).
12. **Slow push-in on every shot; something already moving at the first frame.**
13. **Light as storytelling:** lamp pools, glowing chips, spotlights on lone characters (5:08, 12:46, 19:08), split-lit faces for the villain.
14. **Foreground silhouettes** (backs of heads, lenses, plants) for depth; soft background blur.
15. **Bookends:** dark US map at start and end; dinner at start and end; "We make friends" ×3.
16. **No captions, no logo bug, no spoken subscribe ask.**

---

## L. Element checklist (what to build)

Difficulty = effort to recreate **in code** (Remotion + SVG/React, our usual stack). *Easy* = a reusable component in hours; *medium* = a day or two to get right; *hard* = real rigging, 3D or a lot of art.

| # | Element | Count in video | Example | Difficulty |
|---|---|---|---|---|
| 1 | Black text card with words appearing in sync with the voice | ~45 | 0:04, 19:28 | Easy (needs word timestamps) |
| 2 | Chapter card | 8 | 0:42 | Easy |
| 3 | Title over a scene (one red word) | 1 | 0:40 | Easy |
| 4 | Lower third that types on (coloured side bar) | 7 | 0:06 | Easy |
| 5 | Place/date tag | ~23 | 7:42 | Easy |
| 6 | Sticky-note tag (tilted, pops in) | ~25 | 8:20 | Easy |
| 7 | Rolling number counter (handwritten font) | ~30 | 3:30, 18:52 | Easy |
| 8 | Calendar flip / tear-off | ~15 | 2:56, 18:42 | Medium |
| 9 | Round-head character rig (head, body, stick limbs) | 60+ characters | everywhere | Medium (one rig, many costumes) |
| 10 | Lip-sync mouth set (4-6 shapes) driven by audio | all dialogue | 0:22 | Medium (amplitude- or viseme-driven) |
| 11 | Expression set (brows, eyes, mouth, sweat drop) | ~10 expressions | 6:20 | Easy-medium |
| 12 | Caricature traits for real people (hair, glasses, outfit) | ~12 | 0:06 | Medium (design care; legal care, see M) |
| 13 | Props with faces and limbs (chips, server racks) | 2 types | 10:26 | Medium |
| 14 | Room sets with lighting (lamp pool, window, vignette, bokeh) | ~60 sets | 5:42 | Medium each, hard as a whole library |
| 15 | One-point-perspective corridor/aisle | 6 | 3:26, 17:38 | Medium |
| 16 | Top-down desk with sliding papers and hands | ~15 | 6:24 | Easy-medium |
| 17 | Redrawn newspaper front page | 5 | 15:16 | Easy |
| 18 | Statement / quote note card with highlight + red circle | 4 | 11:58 | Easy |
| 19 | Social-post phone mockup (typed text + highlight) | 1 | 13:30 | Easy |
| 20 | Email window typing + SEND | 3 | 18:02 | Easy |
| 21 | Memo with red underline write-on and margin notes | 3 | 14:10 | Easy |
| 22 | Whiteboard / handwriting write-on (strike-through, circle) | ~8 | 4:44, 12:20 | Medium (stroke-reveal) |
| 23 | Stamp slam (CHINA, MSS, PAID, APPROVED, ×90) | ~6 | 0:34 | Easy |
| 24 | Corkboard with pins and red string | 3 | 0:18 | Easy |
| 25 | Polaroid / freeze-to-photo with flash | 4 | 7:50 | Easy |
| 26 | Parchment map with pins, arcs, region fill | 6 | 0:54, 6:08 | Medium (need map geometry) |
| 27 | Night map with glowing points | 4 | 0:02 | Medium |
| 28 | Bar chart on paper / flipchart | 2 | 8:52-9:00 | Easy |
| 29 | Stock line chart (green up / red down) | 3 | 16:42 | Easy |
| 30 | Unit grid chart (bills, photos, containers, cores) | 5 | 18:26 | Easy |
| 31 | Pie as a real object (pie, piggy bank) | 2 | 5:06, 18:34 | Medium |
| 32 | Balance-scale comparison | 2 | 4:58 | Easy-medium |
| 33 | Growth tower (cash/boxes stacking, breaking the ceiling) | 4 | 4:14 | Medium |
| 34 | Split-screen comparison (2-3 panels, jagged/lightning divider) | ~9 | 3:06, 4:50 | Easy |
| 35 | Shot/reverse-shot two-location dialogue | 3 sequences | 5:43 | Easy (editing) |
| 36 | Slow push-in / pan on every shot | all | everywhere | Easy |
| 37 | Whip-pan with motion blur | 3 | 0:08 | Easy |
| 38 | Rack-focus blur transition | 5 | 2:52 | Easy |
| 39 | Camera/camcorder/viewfinder overlays (REC, timecode, brackets) | 3 | 0:36, 15:46 | Easy |
| 40 | Fake UI screens (terminal, video-call grid, ticket counter) | 4 | 10:02, 13:06 | Easy-medium |
| 41 | Rewind effect montage | 1 | 19:22 | Medium |
| 42 | Glow / bloom on key objects (chips, screens, neon) | constant | 0:26 | Easy (CSS/SVG filters; watch render cost) |
| 43 | Weather and ambient motion (rain, steam, smoke puffs, candle flicker) | ~12 | 0:14, 1:56 | Easy-medium |
| 44 | Crowds of small characters | ~8 | 3:56 | Medium (instancing variants) |
| 45 | 3D camera flight shots (data ribbon, container aerial, tower build) | 4 | 6:56, 8:42 | Hard |
| 46 | Character walk cycles / full-body acting | rare | 1:52, 10:40 | Hard (keep rare) |
| 47 | Voiced dialogue cast (several voices) + narrator | ~120 lines | 0:22 | Medium (TTS voices or actors; needs a timing sheet) |
| 48 | Music bed with cue changes per chapter + drop-outs | 8+ cues | 4:33 | Medium |
| 49 | SFX layer (whooshes, stamps, rings, typing, register, flashes) | 100+ | throughout | Easy-medium (library + cue sheet) |

---

## M. What makes it work, and what to take for our finance channel

**Why viewers keep watching**
1. **A human story carries the facts.** Export controls and server leasing are dry. "A dishwasher who became the key to AI, and a spy at his table" isn't. Each technical point gets attached to a person, a place and a moment.
2. **Dramatic irony from the first 20 seconds.** The viewer knows more than the hero ("Jensen has no idea"). That tension carries 19 minutes and pays off with "Nobody told the man at the table" (17:48).
3. **An open loop is always running.** The hook's phone call pays off at 4:34; the photos at 8:06 pay off at 10:18; "why did nobody tell him?" is asked at 17:20 and left open on purpose.
4. **Chapters with cliffhangers** cut a 20-minute video into eight short episodes. Each ends on a line that makes you want the next.
5. **Something new every 1.5-2 seconds** (cut, counter, prop, stamp, card). The eye always has a reason to stay.
6. **Numbers you can feel.** Every abstract figure becomes a couch, a car, a lemonade stand, or **dollars per American**. For a finance channel this is the single most valuable technique.
7. **Analogies drawn as mini-scenes**, not just said out loud (chefs, car keys by the hour, older cousin with beer, banquet table).
8. **Comedy breaks the tension:** the paper hat falling over his eyes, "Very advanced boxes", "I'm going to need a bigger whiteboard", the burger-eating approver, lobsters, "Up?".
9. **It feels well sourced.** Named sources out loud and on screen (NYT, Bloomberg, spokesman, dated events), statements quoted word for word, highlights on the exact words. Trust keeps viewers on a long video.
10. **Consistency builds a brand:** one font, one character system, one colour code, one "desk" angle, one card style. Viewers learn the grammar and process it faster.
11. **Ending pulled tight:** the rewind to the first scene, the empty chair, a question for the viewer, and the subject's own words. It feels complete and stays with you.
12. **The wallet turn (18:24):** the story suddenly becomes about the viewer's retirement account. This is the bridge our channel would build every episode around.

**Translating it into our own original style (proposals, not copies)**
- **Make it truly paper.** Our twist could be what this video doesn't do: real paper grain, slightly rough cut-out edges, a cardboard/notebook background, hand-drawn line wobble. That gives a distinct identity while keeping the clarity.
- **Our own character template.** Don't reuse the round head / dot eyes / stick limbs combination as is. Pick our own shape language (for example square-ish heads, drawn noses, flat two-tone clothes, or paper-doll joints) and our own signature host or mascot.
- **Our own colour code for money:** e.g. gain = one colour, loss = another, "your money" = a third that appears every time we connect to the viewer's wallet.
- **Bright and daytime by default.** Finance lessons need clarity and calm. Keep dark rooms for scams, crashes and frauds.
- **Keep the strongest techniques, all generic:** text cards for punch lines, chapter cards with hooks, rolling counters, per-person conversions, drawn analogies, redrawn source cards with highlights, top-down desk, dialogue mini-scenes, bookend ending.
- **Make the finance bridge a fixed segment** (e.g. "What this means for your money") at around 80-90% of the runtime, then end on a question.
- **For a 10-minute cap**, scale the structure down: hook (0:00-0:30, title by 0:30), 4-5 chapters of 1.5-2 min each, wallet segment at ~8:30, ending at 9:30-10:00. That is about 160-180 shots at the same pace.
- **Legal and brand care** (this video's approach is a good guide): redraw everything, invent names for fake mastheads and tickers, use generic seals, don't show real logos beyond a simplified mark, and attach a named source to every claim about a real person. Caricatures of real people in money stories should stick to documented facts.
- **What's realistic in code:** about 80% of the element list is easy or medium (cards, counters, tags, notes, charts, splits, push-ins, stamps, maps). The costly parts are a large library of lit room sets, a flexible character rig with lip-sync, voiced dialogue, and 3D flights. Build a reusable kit first (character rig + 10 sets + paper props + data components), then produce episodes from it.
