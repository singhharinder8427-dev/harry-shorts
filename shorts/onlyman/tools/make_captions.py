"""src/timing.json -> voiceover/captions.srt + voiceover/word_times.csv (for upload / hand-off)"""
import json, csv, os
T = json.load(open('src/timing.json')); os.makedirs('voiceover', exist_ok=True)
def ts(x): m, s = divmod(x, 60); h, m = divmod(int(m), 60); return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"
ch = T['chunks']; L = []
for i, c in enumerate(ch):
    end = min(ch[i + 1]['start'] - 0.04, c['end'] + 0.6) if i + 1 < len(ch) else c['end'] + 0.6
    L.append(f"{i+1}\n{ts(c['start'])} --> {ts(end)}\n{c['text']}\n")
open('voiceover/captions.srt', 'w').write('\n'.join(L))
with open('voiceover/word_times.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['word', 'start_s', 'end_s']); [w.writerow([x['w'], x['start'], x['end']]) for x in T['words']]
print(len(ch), 'captions -> voiceover/captions.srt, voiceover/word_times.csv')
