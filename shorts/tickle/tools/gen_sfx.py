"""Cue list for the tickle Short. Every time is a word key from src/timing.json, so a re-time rebuilds the sound.
Also writes the continuous music bed (bed.wav)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
init(DUR)
def giggle(d=1.2, f0=260):
    """a cartoon laugh: 'ha' bursts (buzzy voice through two vowel formants), slightly falling"""
    out = np.zeros(int(SR * d)); n = int(d / 0.16)
    for i in range(n):
        dd = 0.11; t = tt(dd); f = f0 * (1.15 - 0.25 * i / max(1, n)) * (1 + 0.06 * np.sin(2 * np.pi * 7 * t))
        ph = 2 * np.pi * np.cumsum(f) / SR; src = sum(np.sin(k * ph) / k for k in range(1, 9))
        s = bp(src, 500, 1400) + 0.6 * bp(src, 1500, 2600)
        s *= np.sin(np.pi * np.arange(len(t)) / len(t)) ** 0.6
        a = int(SR * i * 0.16); out[a:a + len(s)] += s
    return out
def brush(d=0.8):
    t = tt(d); return bp(rng.standard_normal(len(t)), 2500, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) * env(len(t), 0.05, 0.1) * 0.6
def servo(d=0.6, f0=420, f1=640):
    t = tt(d); f = np.interp(t, [0, d], [f0, f1]); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sign(np.sin(ph)) * 0.25 + 0.4 * np.sin(2 * ph)) * env(len(t), 0.04, 0.1) * 0.5
def hum(d, f=110):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * t)) * env(len(t), 0.3, 0.3) * 0.4
def rain(d):
    out = lp(rng.standard_normal(int(SR * d)), 0.3) * 0.25
    for i in range(int(d * 25)):
        a = int(rng.random() * max(1, len(out) - 2000)); c = plip(2000 + rng.random() * 3000)[:1500] * 0.15; out[a:a + len(c)] += c
    return out * env(len(out), 0.3, 0.3)
def cricket(d=0.9):
    t = tt(d); return np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > 0.3) * env(len(t), 0.01, 0.1) * 0.4
def tick(): return bp(rng.standard_normal(int(0.012 * SR)), 2000, 8000) * np.exp(-tt(0.012) * 300)
C = {'self': K['yourself'], 'fingers': K['fingers'] - 0.25, 'spot': K['spot'] - 0.2, 'nothing': K['nothing'] - 0.3, 'brain': K['brain'] - 0.12,
     'move': K['move'] - 0.35, 'cereb': K['cerebellum'] - 0.3, 'touch': K['touch'] - 0.45, 'lab': K['scientists'] - 0.15, 'moved': K['moved'] - 0.3,
     'touched': K['touched'] - 0.3, 'hardly': K['hardly'] - 0.3, 'delay': K['delay'] - 0.35, 'back': K['tickle7'] - 0.3, 'split': K['only'] - 0.25, 'finale': K['coming'] - 0.45}
# ---- hook: laughing under the tickle, flash rewind
add(giggle(C['self'] - 0.1, 280), 0.0, -14); add(brush(C['self']), 0.0, -22)
add(whoosh(0.5, 400, 5000, 0.8), C['self'] - 0.35, -12); add(shimmer(0.9), C['self'] - 0.15, -20)
# ---- tickling himself: nothing
add(brush(C['nothing'] - C['self']), C['self'] + 0.1, -24)
add(pop_(600, 0.08), C['fingers'], -18); add(pop_(700, 0.08), C['spot'], -16)
for i in range(6): add(thud(150, 0.08), C['spot'] + 0.15 + i * 0.13, -22)
add(whoosh(0.4, 300, 3000, 0.9), C['nothing'], -12); add(thud(80, 0.25), C['nothing'] + 0.36, -12)
add(cricket(0.9), K['nothing'] + 0.2, -22)
# ---- into the head, the brain
add(whoosh(0.6, 200, 5000, 0.85), C['brain'] - 0.45, -9)
add(hum(C['lab'] - C['brain']), C['brain'], -24)
add(pop_(500, 0.14), K['brain'] - 0.05, -10); add(shimmer(0.9), K['brain'] + 0.1, -18)
add(whoosh(0.5, 800, 5000, 0.5), K['step'] - 0.2, -18); add(plip(1800), K['ahead'] - 0.02, -12)
add(whoosh(0.4, 400, 2500, 0.5), C['move'], -18); add(ding(880, 0.5), K['move'], -20)
add(whoosh(0.6, 600, 3000, 0.4), K['copy'] - 0.2, -18); add(plip(1300), K['copy'] + 0.05, -14); add(plip(1500), K['command'] - 0.1, -16)
add(pop_(900, 0.08), K['command'] + 0.15, -14)
add(shimmer(0.9), K['predicts'] - 0.05, -14); add(ding(1568, 0.6), K['predicts'], -20)
add(brush(0.6), K['feel'] - 0.1, -22)
add(ding(1047, 0.7), K['cerebellum'] + 0.05, -16); add(whoosh(0.3, 600, 4000, 0.7), C['cereb'] + 0.1, -18)
add(whoosh(0.9, 500, 3000, 0.3), K['sends'] - 0.05, -14)
add(whoosh(0.5, 200, 1200, 0.5), K['touch'] - 0.1, -14); add(thud(120, 0.2), K['touch'], -14)
add(pop_(1200, 0.1), K['down'] - 0.03, -8); add(deflate(0.5), K['down'], -12); [add(plip(2600 + i * 300), K['down'] + 0.05 + i * 0.05, -20) for i in range(4)]
add(whoosh(0.6, 300, 1500, 0.4), K['down'] + 0.15, -22); add(thud(70, 0.3), K['arrives'], -16)
# ---- the lab
add(whoosh(0.45, 300, 4000, 0.7), C['lab'] - 0.2, -11)
add(rain(C['split'] - C['lab']), C['lab'], -24)
add(servo(0.6, 300, 700), K['robots'] - 0.05, -14); add(servo(0.6, 340, 760), K['robots'] + 0.1, -16); [add(tick(), K['robots'] + 0.15 + i * 0.06, -18) for i in range(3)]
for i in range(4): add(servo(0.35, 500, 600 + (i % 2) * 120), K['moved'] + i * 0.5, -22)
add(brush(1.6), K['touched'] - 0.1, -20)
for i in range(5): add(tick(), K['same'] + i * 0.2, -16)
add(cricket(0.8), K['hardly'] + 0.15, -24)
for i in range(6): add(tick(), K['delay'] - 0.1 + i * 0.09, -14)
add(pop_(800, 0.12), K['fifth'] - 0.08, -10); add(ding(1318, 0.5), K['fifth'], -18)
add(brush(1.2), K['tickle7'] - 0.2, -18)
add(whoosh(0.3, 600, 4000, 0.7), K['back'] - 0.15, -12); add(giggle(1.6, 300), K['back'] - 0.05, -10); add(ding(1760, 0.4), K['back'] + 0.2, -18)
# ---- why split + finale
add(giggle(0.9, 280) * 0.5, K['feel8'] + 0.15, -16); add(whoosh(0.35, 400, 4000, 0.8), K['feel8'] - 0.15, -11)
add(whoosh(0.5, 400, 5000, 0.8), C['finale'] - 0.3, -14)
for i in range(4): add(thud(200, 0.05), C['finale'] + 0.08 + i * 0.12, -24)
add(pop_(500, 0.12), K['coming'] + 0.05, -10)
add(giggle(DUR - K['coming'] - 0.2, 280), K['coming'] + 0.1, -14); add(brush(DUR - K['coming'] - 0.1), K['coming'] + 0.05, -22)
# ---- subscribe CTA
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9)
add(click(), K['facts'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['facts'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['body'] - 0.05 + i * 0.09, -20)
write(f"public/{T['short']}/sfx.wav", DUR)
y = bed(DUR, speech=[(s['start'], s['end']) for s in S], bpm=108, mood='curious')
write_bed(f"public/{T['short']}/bed.wav", y)
print('sfx + bed written')
