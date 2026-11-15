"""Forced alignment of a voice take to the script, one sentence at a time, snapped to real pauses.
usage (aligner venv python): align_take.py take.mp3 script.txt out_word_times.json
Output: one {w, start, end} per script word (seconds in the take)."""
import os, sys, re, json, subprocess, numpy as np
from pocketsphinx import Decoder
SPOKEN = {'what-if': 'what if'}
try:   # per-short pronunciations live in story.json -> "spoken": {"1,400": "fourteen hundred"}
    SPOKEN.update(json.load(open('story.json')).get('spoken', {}))
except FileNotFoundError: pass
take, script, outp = sys.argv[1:4]
pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', take, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
toks = open(script).read().split()
dec = Decoder(samprate=16000, bestpath=False, loglevel='ERROR') if True else None
def known(w): return dec.lookup_word(w) is not None
def spoken(tk):
    sub = (SPOKEN.get(tk.strip('.,?')) or re.sub(r"[^a-z']", '', tk.lower())).split()
    out = []
    for w in sub:
        if not known(w):
            for alt in (w.replace("'s", 's'), w.replace("'", ''), w.rstrip('s').rstrip("'")):
                if known(alt): w = alt; break
            else: raise SystemExit(f'not in dictionary: {w} (add a pronounced spelling to SPOKEN)')
        out.append(w)
    return out
def syl(w): return max(1, len(re.findall(r'[aeiouy]+', w)))
# sentences
sents, cur = [], []
for i, tk in enumerate(toks):
    cur.append(i)
    if tk.rstrip('"\'\u201d')[-1] in '.?': sents.append(cur); cur = []
if cur: sents.append(cur)
# loudness and pauses (10 ms hops)
hop = 160; n = len(x) // hop
rms = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
quiet = rms < rms.max() - 42
sil, i = [], 0
while i < n:
    if quiet[i]:
        j = i
        while j < n and quiet[j]: j += 1
        sil.append((i / 100, j / 100)); i = j
    else: i += 1
loud = np.where(~quiet)[0]; sp0, sp1 = loud[0] / 100, (loud[-1] + 1) / 100
# sentence boundaries: pause nearest the syllable-proportional estimate (long pauses preferred)
ssyl = [sum(syl(w) for i in s for w in spoken(toks[i])) for s in sents]
cum = np.cumsum(ssyl) / sum(ssyl); bounds = []; last = sp0
cands = [s for s in sil if s[1] - s[0] >= 0.15 and s[0] > sp0 and s[1] < sp1]
for k in range(len(sents) - 1):
    exp = sp0 + cum[k] * (sp1 - sp0)
    opts = [s for s in cands if s[0] > last + 0.3]
    best = min(opts, key=lambda s: abs((s[0] + s[1]) / 2 - exp) - 0.8 * (s[1] - s[0]))
    bounds.append(best); last = best[1]
if os.environ.get('BOUNDS'):   # explicit sentence boundaries (seconds, comma-separated) when a take's comma pauses fool the estimate
    bt = [float(v) for v in os.environ['BOUNDS'].split(',')]; assert len(bt) == len(sents) - 1, (len(bt), len(sents) - 1)
    bounds = [(v - 0.02, v + 0.02) for v in bt]
edges = [0.0] + [(a + b) / 2 for a, b in bounds] + [n / 100]
res = [None] * len(toks); fallback = []
for si, s in enumerate(sents):
    a, b = edges[si], edges[si + 1]
    seg = (x[int(a * 16000):int(b * 16000)] * 32768).astype(np.int16).tobytes()
    words, groups = [], []
    for i in s:
        sub = spoken(toks[i]); groups.append(list(range(len(words), len(words) + len(sub)))); words += sub
    sg = []
    for beams in ({}, dict(beam=1e-80, wbeam=1e-60, pbeam=1e-80), dict(beam=1e-120, wbeam=1e-100, pbeam=1e-120, fillprob=1e-2)):
        d = Decoder(samprate=16000, bestpath=False, loglevel='FATAL', **beams)
        d.set_align_text(' '.join(words))
        d.start_utt(); d.process_raw(seg, full_utt=True); d.end_utt()
        sg = [(re.sub(r'\(\d+\)$', '', g.word), a + g.start_frame / 100, a + (g.end_frame + 1) / 100) for g in (d.seg() or [])]
        sg = [g for g in sg if g[0] not in ('<sil>', '<s>', '</s>', '(NULL)') and not g[0].startswith('[') and not g[0].startswith('+')]
        if len(sg) == len(words): break
    if len(sg) != len(words):   # fallback: spread by syllables over the loud part of this sentence
        fallback.append(si)
        li = loud[(loud >= a * 100) & (loud < b * 100)]; s0, s1 = li[0] / 100, (li[-1] + 1) / 100
        w8 = np.array([syl(w) for w in words], float); c = np.concatenate([[0], np.cumsum(w8)]) / w8.sum()
        sg = [(w, s0 + c[j] * (s1 - s0), s0 + c[j + 1] * (s1 - s0)) for j, w in enumerate(words)]
    for i, g in zip(s, groups): res[i] = [sg[g[0]][1], sg[g[-1]][2]]
# snap word gaps to real pauses (>= 0.12 s) when the aligner boundary is within 0.15 s
for k in range(len(res) - 1):
    bnd = (res[k][1] + res[k + 1][0]) / 2
    near = [s for s in sil if s[1] - s[0] >= 0.12 and abs((s[0] + s[1]) / 2 - bnd) < 0.15 + (s[1] - s[0]) / 2 and s[0] > sp0 and s[1] < sp1]
    if near: res[k][1], res[k + 1][0] = near[0][0], near[0][1]
out = [{'w': tk, 'start': round(r[0], 3), 'end': round(r[1], 3)} for tk, r in zip(toks, res)]
json.dump(out, open(outp, 'w'), indent=1)
print(f'{len(out)} words, speech {out[0]["start"]:.2f}-{out[-1]["end"]:.2f}s; sentence pauses at ' + ', '.join(f'{(a + b) / 2:.2f}' for a, b in bounds))
if fallback: print('WARNING: aligner failed on sentences', fallback, '- those words are spread by syllables (check them)')
