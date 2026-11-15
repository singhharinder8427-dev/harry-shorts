"""src/timing.json + story.json beats -> voiceover/TIMING_SHEET.md (what the user needs to record the voice take)"""
import json, os
T = json.load(open('src/timing.json')); S = T['sentences']; K = T['keys']
st = json.load(open('story.json')); beats = st.get('beats', {})
os.makedirs('voiceover', exist_ok=True)
L = [f"# Voice-over timing sheet: \"{T.get('title', '')}\"\n",
"The video is built on **estimated** timing (a natural conversational pace). When your take arrives, the whole video is re-timed to it, so you don't need to hit these numbers exactly; they are a guide for pace.\n",
"## Record one single take\n",
"Paste the whole script below into your voice tool as **one** generation (or record it yourself), export **MP3 or WAV (44.1/48 kHz)** and send it back.\n",
"```\n" + open('voiceover/script.txt').read().strip() + "\n```\n",
f"- Target length: about **{S[-1]['end'] - S[0]['start']:.0f} s** of speech. The whole Short must stay at or under 45 s.",
"- Paste only the script: plain text, no tags, no notes like \"speak slowly\". A text-to-speech model reads notes out loud.",
"- Keep the words exactly as written: the captions and the alignment assume the script is read as written. Numbers: say how the voice read them (\"fourteen hundred\" vs \"one thousand four hundred\").",
"- The last line is the subscribe line: warm and direct like the rest, not salesy. If a take over-acts, regenerate.\n",
"## Voice settings\n", "| Setting | Value |\n|---|---|",
"| Voice | a normal, natural conversational voice (male or female), not a deep narrator, not a hype voice |",
"| Stability / consistency (if your tool has it) | medium (about 0.5) |",
"| Style / exaggeration (if your tool has it) | 0: more style over-acts and runs long |",
"| Speed | 1.0 to start; if the take runs long, `speed = take length / target length` |\n",
"## Sentence targets (only if you make one clip per sentence)\n",
"Trim the silence at the start of each clip; each clip is placed at its mark.\n",
"| # | Place at (s) | Frame @60 | Target length (s) | Words | Text |\n|---|---|---|---|---|---|"]
for i, s in enumerate(S):
    L.append(f"| {i+1} | {s['start']:.2f} | {round(s['start']*60)} | {s['end']-s['start']:.2f} | {len(s['text'].split())} | {s['text']} |")
if beats:
    L += ["\n## Key words the picture lands on (estimated times)\n", "| Word | Time (s) | What happens |\n|---|---|---|"]
    for k, d in beats.items(): L.append(f"| {k} | {K[k]:.2f} | {d} |")
L += ["\n## Captions (estimated)\n", "| # | From (s) | To (s) | Text |\n|---|---|---|---|"]
for i, c in enumerate(T['chunks']): L.append(f"| {i+1} | {c['start']:.2f} | {c['end']:.2f} | {c['text']} |")
open('voiceover/TIMING_SHEET.md', 'w').write('\n'.join(L) + '\n'); print('voiceover/TIMING_SHEET.md written')
