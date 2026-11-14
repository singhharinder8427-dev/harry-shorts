"""src/timing.json -> voiceover/TIMING_SHEET.md"""
import json
T = json.load(open('src/timing.json')); S = T['sentences']; K = T['keys']
L = ["# Voice-over timing sheet: \"What if all the water vanished?\"\n",
"The video is built on **estimated** timing (4.7 syllables/s, a natural conversational pace). When your take arrives, I re-time the whole video to it, so you don't need to hit these numbers exactly. They are a guide for pace.\n",
"## Easiest: one single take\n",
"Paste the whole script below into ElevenLabs as **one** generation, export **MP3 (44.1 kHz, 128 kbps or higher)** and send it to me.\n",
"```\n" + open('voiceover/script.txt').read().strip() + "\n```\n",
f"- Target length: about **{S[-1]['end'] - S[0]['start']:.0f} s** of speech (about 37 s to 43 s is fine).",
"- Paste only the script: plain text, no tags, no notes like \"speak slowly\". A standard TTS model reads notes out loud.",
"- Write the number as `1,400`. Tell me whether the voice says \"fourteen hundred\" or \"one thousand four hundred\".",
"- The last line is the subscribe call to action. It should sound warm and direct, like the rest, not salesy. If the first take over-acts it, regenerate.",
"- Keep the words exactly as written. The captions and alignment assume the script is read as written.\n",
"## Settings\n", "| Setting | Value |\n|---|---|",
"| Voice | a normal, natural conversational voice, not a deep narrator. Good library picks: *Tim Riley - Natural. Conversational*, *James - Natural*, *Jerry B.*, *Alex* |",
"| Model | the newest multilingual / v3 model you have (plain text works on every model) |",
"| Stability | about 0.50 |", "| Similarity | about 0.75 |", "| Style exaggeration | 0 (higher values over-act and run long) |",
"| Speed | 1.00 to start; if the take is over 44 s, try `speed = take length / 41` |\n",
"## Sentence targets (only if you prefer one clip per sentence)\n",
"If you make separate clips, trim the silence at the start of each clip and send them all. I place each at its mark.\n",
"| # | Place at (s) | Frame @60 | Target length (s) | Words | Text |\n|---|---|---|---|---|---|"]
for i, s in enumerate(S):
    L.append(f"| {i+1} | {s['start']:.2f} | {round(s['start']*60)} | {s['end']-s['start']:.2f} | {len(s['text'].split())} | {s['text']} |")
L.append("\n## Key words the picture lands on (estimated times)\n")
L.append("| Word | Time (s) | What happens |\n|---|---|---|")
beats = [('vanished', "Earth's oceans drain, clouds pop, Earth gasps"), ('you', 'cut to the character'), ('sixty', 'X-ray water fills his body to 60%'),
 ('shrivel', 'he shrivels, the flower wilts'), ('oceans', 'camera glides to the sea, the sea drains'), ('three', 'depth bracket + "avg ≈ 3.7 km deep"'),
 ('disappear', 'clouds squeeze their eyes and pop'), ('vapor', 'cut to space: vapor blanket + label'), ('half', '"≈ half the greenhouse effect" label'),
 ('without', 'the blanket pops'), ('escape', 'heat squiggles fly off into space'), ('night', 'night falls, Earth shivers'),
 ('desert', 'land turns to sand, cacti pop up'), ('ball', 'droplets roll into one small water ball'), ('under', '"under 1,400 km" bracket'),
 ('nine', "row of 9 balls across Earth's width"), ('depends', 'the ball pours back in, oceans refill'),
 ('subscribe', 'SUBSCRIBE button pops in, Earth looks up, cursor flies in'), ('never', 'click: button turns "SUBSCRIBED ✓", sparkles'),
 ('next', 'the bell rings; the button leaves and the last frame matches frame 0 (loop)')]
for k, d in beats: L.append(f"| {k} | {K[k]:.2f} | {d} |")
L.append("\n## Captions (estimated)\n")
L.append("| # | From (s) | To (s) | Text |\n|---|---|---|---|")
for i, c in enumerate(T['chunks']): L.append(f"| {i+1} | {c['start']:.2f} | {c['end']:.2f} | {c['text']} |")
open('voiceover/TIMING_SHEET.md', 'w').write('\n'.join(L) + '\n'); print('sheet ok')
