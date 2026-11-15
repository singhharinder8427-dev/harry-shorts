"""story.json (+ optional real word times from a take) -> src/timing.json
story.json: {short, title, chunks[], syllables{}, keys{name: [sentence index, word]}, beats{name: what happens}}
Estimate: --rate syllables/s (default 4.7), +0.2 s after a comma, +0.5 s after a sentence, first word at 0.4 s.
Keys: name -> [sentence index, word] (first occurrence of that word in that sentence)."""
import json, re, sys, argparse
ap = argparse.ArgumentParser(); ap.add_argument('story'); ap.add_argument('--take'); ap.add_argument('--out', required=True)
ap.add_argument('--tail', type=float, default=1.6); ap.add_argument('--rate', type=float, default=4.7); a = ap.parse_args()
st = json.load(open(a.story))
words = []  # {w, chunk, sent}
sent = 0
for ci, ch in enumerate(st['chunks']):
    for w in ch.split():
        words.append({'w': w, 'chunk': ci, 'sent': sent})
        if w.rstrip('"\'”')[-1] in '.?': sent += 1
def norm(w): return re.sub(r"[^a-z0-9',]", '', w.lower()).strip(',')
def syl(w):
    n = norm(w)
    if n in st['syllables']: return st['syllables'][n]
    g = re.findall(r'[aeiouy]+', n); c = len(g) - (1 if n.endswith('e') and len(g) > 1 else 0)
    return max(1, c)
if a.take:
    tk = json.load(open(a.take))
    assert len(tk) == len(words), f'take has {len(tk)} words, script {len(words)}'
    for w, t in zip(words, tk): w['start'], w['end'] = t['start'], t['end']
    voffset = 0.40 - words[0]['start']
    for w in words: w['start'] += voffset; w['end'] += voffset
else:
    voffset = 0.0; t = 0.4
    for w in words:
        d = syl(w['w']) / a.rate; w['start'] = round(t, 3); w['end'] = round(t + d, 3); t += d
        e = w['w'].rstrip('"\'”')[-1]
        if e in '.?': t += 0.5
        elif e == ',': t += 0.2
keys, keyEnd = {}, {}
for name, (si, word) in st['keys'].items():
    m = [w for w in words if w['sent'] == si and norm(w['w']) == word]
    assert m, (name, si, word)
    keys[name] = round(m[0]['start'], 3); keyEnd[name] = round(m[0]['end'], 3)
chunks = []
for ci, ch in enumerate(st['chunks']):
    ws = [i for i, w in enumerate(words) if w['chunk'] == ci]
    chunks.append({'text': ch, 'w0': ws[0], 'w1': ws[-1], 'start': words[ws[0]]['start'], 'end': words[ws[-1]]['end']})
sents = []
for si in range(sent):
    ws = [w for w in words if w['sent'] == si]
    sents.append({'start': ws[0]['start'], 'end': ws[-1]['end'], 'text': ' '.join(w['w'] for w in ws)})
dur = round(words[-1]['end'] + a.tail, 2)
out = {'short': st.get('short', 'short'), 'title': st.get('title', ''), 'duration': dur, 'voiceOffset': round(voffset, 3), 'estimated': not a.take,
       'words': [{'w': w['w'], 'start': round(w['start'], 3), 'end': round(w['end'], 3)} for w in words],
       'chunks': chunks, 'sentences': sents, 'keys': keys, 'keyEnd': keyEnd}
json.dump(out, open(a.out, 'w'), indent=1)
print(f"{len(words)} words, {len(sents)} sentences, speech ends {words[-1]['end']:.2f}s, duration {dur}s")
for k, v in keys.items(): print(f'  {k:10s} {v:6.2f}')
