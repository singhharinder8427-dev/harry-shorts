"""Cue list for the chicken Short. Every time is a word key from src/timing.json, so a re-time rebuilds the sound.
Also writes the continuous music bed (bed.wav)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
init(DUR)
def cluck(f=420, n=2):
    out = np.zeros(int(SR * (0.11 * n + 0.05)))
    for i in range(n):
        d = 0.07; t = tt(d); s = (np.sign(np.sin(2 * np.pi * f * (1 + 0.15 * i) * t)) * 0.4 + np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 38)
        a = int(SR * 0.11 * i); out[a:a + len(s)] += bp(s, 300, 3000)
    return out
def crow(d=0.9):
    t = tt(d); f = np.interp(t, [0, 0.12, 0.3, 0.55, d], [520, 760, 700, 820, 480]) * (1 + 0.03 * np.sin(2 * np.pi * 9 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR; s = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)
    return bp(s, 300, 4000) * env(len(t), 0.03, 0.2)
def knock():
    x = thud(160, 0.12); c = click(); x[:len(c)] += 0.6 * c; return x
def rumble(d=1.0):
    t = tt(d); return lp(rng.standard_normal(len(t)), 0.02) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)) * env(len(t), 0.1, 0.3) * 6
def crack(): return bp(rng.standard_normal(int(0.05 * SR)), 1500, 6000) * np.exp(-tt(0.05) * 90)
def step(): return 0.5 * thud(120, 0.08)
def creak(d=0.5):
    t = tt(d); f = 180 + 120 * t / d; return bp(np.sign(np.sin(2 * np.pi * np.cumsum(np.full(len(t), 1.0)) * f / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 31 * t)), 200, 2000) * env(len(t), 0.05, 0.1)
def crackle(d):
    out = np.zeros(int(SR * d))
    for i in range(int(d * 18)):
        a = int(rng.random() * (len(out) - 2000)); c = crack() * (0.3 + rng.random() * 0.7); out[a:a + len(c)] += c
    return out + 0.15 * lp(rng.standard_normal(len(out)), 0.05)
SA = lambda i: S[i]['start']
C = {'wide': K['money'] - 0.3, 'gone': K['gone'] - 0.2, 'days': K['hungry'] - 0.5, 'gets': K['chicken'] - 0.95, 'cook': K['first'] - 0.25, 'best': K['best'] - 0.15,
     'last': K['last'] - 0.25, 'second': K['second'] - 0.2, 'egg': K['egg'] - 0.4, 'rooster': K['rooster'] - 0.2, 'noeggs': K['noeggs'] - 0.25, 'knock': K['knocks'] - 0.6,
     'meet': K['meet'] - 0.3, 'share': K['share'] - 0.25, 'wanted': K['wanted'] - 0.2, 'chicks': K['chicks'] - 0.2, 'weeks': K['weeks'] - 0.25, 'hatch': K['hatch'] - 0.2,
     'months': K['months'] - 0.25, 'laying': K['laying'] - 0.25, 'fills': K['fills'] - 0.3, 'keep': K['keep'] - 0.35, 'hires': K['hires'] - 0.3, 'pays': K['pays'] - 0.2,
     'same': K['same1'] - 0.2, 'poor': K['poor'] - 0.3, 'end': K['subscribe'] - 0.15}
# ambience: day breeze everywhere, crickets-ish crackle at night
add(breeze(K['lose']), 0, -24)
add(breeze(C['days'] - C['wide']) * 0.7, C['wide'], -26)
# ---- intro / vanish
add(cluck(500, 1) * 0, 0, -30)
add(whoosh(0.6, 200, 1800, 0.6), K['lose'] - 0.2, -14); add(shimmer(0.8), K['lose'] + 0.1, -20)
add(pop_(700, 0.12), K['money'] - 0.05, -9); [add(ding(2400 + i * 300, 0.3), K['money'] + i * 0.06, -24) for i in range(3)]
add(thud(70, 0.6), K['houses'] - 0.05, -6); add(deflate(0.5), K['houses'], -12)
add(whoosh(0.5, 150, 1200, 0.5), K['fields'] - 0.15, -12); add(thud(90, 0.3), K['fields'] + 0.2, -12)
add(whoosh(1.2, 200, 900, 0.3), K['gone'] + 0.1, -18)
# ---- three hungry days
for i in range(3): add(whoosh(0.5, 300, 2000, 0.5), C['days'] + 0.2 + i * (C['gets'] - C['days']) / 3, -20)
add(rumble(0.9), K['hungry'] + 0.05, -6); add(rumble(0.7), K['hungry'] + 1.2, -9)
# ---- one chicken each
for i in range(3):
    add(whoosh(0.35, 800, 4000, 0.8), K['chicken'] - 0.55 + i * 0.22, -18); add(pop_(600, 0.1), K['chicken'] - 0.2 + i * 0.22, -10)
    add(cluck(420 + i * 60, 2), K['chicken'] - 0.12 + i * 0.22, -12)
# ---- Ned's dinner
add(whoosh(0.4, 400, 3500, 0.7), C['cook'] - 0.2, -14)
add(crackle(C['last'] + 0.4 - C['cook']), C['cook'], -18)
add(sizzle(1.0), K['cooks'], -22)
add(ding(1318, 0.5), K['best'], -18); add(slurp(0.5), K['best'] + 0.3, -14); add(slurp(0.5), K['best'] + 1.2, -16)
add(deflate(0.6), K['last'] - 0.1, -10); add(thud(80, 0.3), K['last'] + 0.2, -14)
# ---- Sara's hen and eggs
add(cluck(460, 3), K['hen'] + 0.1, -12)
add(pop_(900, 0.1), K['egg'] - 0.05, -9); add(ding(1568, 0.5), K['egg'], -18)
add(whoosh(0.4, 300, 2000, 0.5), K['egg'] + 1.0, -22); add(pop_(950, 0.1), C['rooster'] - 0.35, -11)
# ---- rooster, no eggs
add(crow(0.8), K['rooster'] + 0.1, -9)
add(cluck(380, 1), K['noeggs'] - 0.1, -14)
add(whoosh(0.35, 500, 4000, 0.7), K['noeggs'] + 0.38, -14); add(pop_(500, 0.14), K['noeggs'] + 0.72, -12)
# ---- the deal
for i in range(5): add(step(), C['knock'] + 0.1 + i * 0.22, -14)
for i in range(3): add(knock(), K['knocks'] - 0.05 + i * 0.2, -6)
add(creak(0.5), K['knocks'] + 0.5, -16)
add(cluck(420, 2), K['meet'] - 0.1, -14); add(cluck(520, 2), K['meet'] + 0.15, -14); add(pop_(1200, 0.08), K['meet'] + 0.25, -12); add(shimmer(0.6), K['meet'] + 0.3, -22)
add(click() * 0.6, K['share'], -14); add(pop_(800, 0.1), K['share'] + 0.4, -12)
add(ding(1760, 0.5), K['wanted'], -18)
add(shimmer(0.9), K['chicks'], -16)
# ---- inside the egg, hatch
add(whoosh(0.6, 200, 5000, 0.85), C['weeks'] - 0.45, -10)
for i in range(7): add(ding(880 + i * 60, 0.25) * 0.5, C['weeks'] + 0.2 + i * (C['hatch'] - C['weeks'] - 0.3) / 7, -26)
for i in range(4): add(crack(), K['hatch'] - 0.05 + i * 0.16, -8); add(pop_(1300, 0.06), K['hatch'] + 0.05 + i * 0.16, -14)
for i in range(4): add(plip(2600 + i * 200), K['hatch'] + 0.2 + i * 0.16, -14)
# ---- months, laying
for i in range(5): add(whoosh(0.3, 400, 2500, 0.5), C['months'] + 0.2 + i * (C['laying'] - C['months'] - 0.4) / 5, -24)
add(cluck(450, 2), C['laying'] - 0.4, -14)
for i in range(4): add(pop_(900 + i * 80, 0.09), K['laying'] - 0.05 + i * 0.22, -10); add(ding(1568 + i * 200, 0.35), K['laying'] + i * 0.22, -20)
# ---- fills up, can't keep up
for i, d in enumerate([0, 0.35, 0.7]):
    for j in range(2 ** (i + 2) // 2): add(pop_(1000 + rng.random() * 600, 0.06), K['fills'] + d + j * 0.03, -16)
add(whoosh(0.6, 200, 3000, 0.4), K['fills'] + 0.12, -12)
for i in range(6): add(cluck(400 + i * 40, 1), K['fills'] + 0.4 + i * 0.25, -16)
for i in range(8): add(step(), C['keep'] + 0.05 + i * 0.13, -12)
for i in range(5): add(cluck(380 + i * 70, 2), C['keep'] + i * 0.25, -15)
# ---- hires, pays
for i in range(5): add(step(), C['hires'] + 0.05 + i * 0.25, -15)
add(pop_(700, 0.1), K['hires'] + 0.5, -14)
for i in range(3): add(plip(1300 + i * 120), K['pays'] + 0.2 + i * 0.3, -10)
# ---- same start, same chicken; poor, comfortable, rich
add(shimmer(1.0), C['same'] - 0.1, -16); add(whoosh(0.35, 600, 4000, 0.7), K['same2'] - 0.05, -14)
add(thud(90, 0.3), K['poor'] + 0.1, -16)
add(whoosh(0.4, 300, 3000, 0.5), K['comfortable'] - 0.3, -12); add(ding(1318, 0.5), K['comfortable'] + 0.1, -20)
add(whoosh(0.4, 300, 3000, 0.5), K['rich'] - 0.3, -12)
for i in range(4): add(ding(1568 * 2 ** (i * 4 / 12), 0.6), K['rich'] + 0.1 + i * 0.08, -18)
# ---- subscribe CTA
add(whoosh(0.35, 600, 4000, 0.6), C['end'] - 0.2, -16)
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9)
add(click(), K['miss'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['miss'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['lesson'] - 0.05 + i * 0.09, -20)
add(cluck(500, 2), DUR - 1.0, -16)
write(f"public/{T['short']}/sfx.wav", DUR)
y = bed(DUR, speech=[(s['start'], s['end']) for s in S], bpm=104, mood='bright')
write_bed(f"public/{T['short']}/bed.wav", y)
print('sfx + bed written')
