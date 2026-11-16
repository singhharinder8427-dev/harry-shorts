"""Cue list for the last-day-on-Earth Short. Every time is a word key / phrase start from src/timing.json,
so a re-time rebuilds the sound. Also writes the continuous music bed (bed.wav)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; CHK = T['chunks']; DUR = T['duration']
init(DUR)
CH = lambda i: CHK[i]['start'] - 0.15
def rumble(d=1.0, f=0.02):
    t = tt(d); return lp(rng.standard_normal(len(t)), f) * (0.6 + 0.4 * np.sin(2 * np.pi * 5 * t)) * env(len(t), 0.1, 0.3) * 6
def boom(d=2.2):
    t = tt(d); return (lp(rng.standard_normal(len(t)), 0.03) * 8 + sweep(70, 30, d)) * np.exp(-t * 2.2) * env(len(t), 0.003, 0.4)
def crack(): return bp(rng.standard_normal(int(0.05 * SR)), 1500, 6000) * np.exp(-tt(0.05) * 90)
def thunder(d=1.6):
    x = boom(d) * 0.7; c = crack(); x[:len(c)] += 1.2 * c; return x
def beep(f=1100, d=0.09): t = tt(d); return np.sin(2 * np.pi * f * t) * env(len(t), 0.004, 0.02)
def tick(): return 0.6 * click()
def coin(f=2400): t = tt(0.25); return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 18)
def rustle(d=0.6): t = tt(d); return bp(rng.standard_normal(len(t)), 2000, 8000) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t)) * env(len(t), min(0.05, d * 0.3), min(0.2, d * 0.4))
def step(): return 0.5 * thud(120, 0.08)
def wave(d=3.0):
    t = tt(d); return lp(rng.standard_normal(len(t)), 0.05) * 5 * env(len(t), d * 0.6, 0.6) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * t))
def crowd(d): return chatter(d)
C = {'money': CH(1), 'robs': CH(2), 'story': CH(3), 'rock': CH(5), 'falls': CH(7), 'kmps': CH(8), 'race': CH(9), 'moon': CH(11), 'buy': CH(13), 'run': CH(15), 'neither': CH(16),
     'impact': CH(17), 'dust': CH(20), 'waves': CH(22), 'dino': CH(25), 'lab': CH(26), 'dart': CH(28), 'orbit': CH(31), 'why': CH(33), 'fin': CH(36), 'loop': DUR - 0.75}
# ---- hook: the doomed street
add(rumble(C['money'] + 0.2), 0, -10); add(sizzle(C['money']), 0, -20)
for i in range(3): add(beep(1400), 0.1 + i * 0.25, -16)
add(whoosh(0.4, 3000, 200, 0.3), C['money'] - 0.25, -12); add(shimmer(0.9), C['money'] - 0.1, -18)
# ---- office: counting money
for i in range(6): add(rustle(0.12), K['counts'] + i * 0.11, -20)
add(coin(2600), K['money'], -18); add(rustle(0.7), K['money'] - 0.05, -16)
# ---- street: the thief
add(breeze(C['story'] - C['robs']), C['robs'], -24)
add(pop_(600, 0.12), K['robs'] - 0.05, -10)
for i in range(6): add(coin(2200 + i * 180), K['robs'] + 0.1 + i * 0.07, -20)
for i in range(4): add(step(), K['robs'] + 0.3 + i * 0.22, -14)
# ---- the sky: storm, lightning, the red star
add(breeze(C['rock'] - C['story']) * 1.4, C['story'], -18)
add(rumble(2.0, 0.01), K['god'] - 0.3, -12)
add(thunder(1.8), K['enough'] - 0.05, -5)
add(ding(880, 1.2) * 0.6, K['enough'] + 0.1, -20)
# ---- space: the rock turns, telemetry beeps
add(whoosh(0.6, 200, 2500, 0.7), C['rock'] - 0.4, -12)
add(rumble(1.2, 0.01), K['turns'] - 0.2, -10)
for i in range(3): add(beep(1200 + i * 200), K['turns'] + 0.05 + i * 0.12, -16)
add(pop_(900), K['wide'] - 0.05, -16)
# ---- it falls: slam past the rock
add(whoosh(0.7, 150, 3500, 0.75), K['falls'] - 0.25, -6)
add(rumble(0.8, 0.02), K['falls'] + 0.3, -12)
for i in range(int((C['race'] - C['kmps'] - 0.3) / 0.36)): add(tick(), C['kmps'] + 0.3 + i * 0.36, -14)
add(whoosh(0.35, 800, 5000, 0.5), C['race'] + 0.3, -14); add(pop_(1500, 0.06), C['race'] + 0.35, -14)
add(whoosh(0.9, 300, 4000, 0.4), C['race'] + 0.35, -12)
# ---- the Moon: path draws, the clock ticks
add(whoosh(0.5, 300, 2500), C['moon'] - 0.25, -16)
for i in range(10): add(pop_(1300 + i * 40, 0.04), K['moon'] + i * 0.18, -22)
add(ding(1568, 0.6), K['nine'], -16)
for i in range(int((C['neither'] - K['impact']) / 0.5)): add(beep(1000, 0.07), K['impact'] + 0.2 + i * 0.5, -22)
# ---- the boss tries to buy his way out
add(rustle(1.3), K['out'] - 0.2, -14); add(breeze(1.4), K['out'] - 0.1, -18)
# ---- the thief runs
for i in range(5): add(step(), C['run'] + 0.05 + i * 0.18, -12)
add(rumble(C['impact'] - C['run']), C['run'], -14)
# ---- neither helps: shadow falls
add(whoosh(1.0, 100, 900, 0.6), K['helps'] - 0.3, -10)
# ---- impact cross-section
add(whoosh(0.4, 400, 3500, 0.7), C['impact'] - 0.2, -14)
add(whoosh(1.0, 2000, 300, 0.85), K['vapour'] - 0.9, -10)
add(boom(2.4), K['vapour'] - 0.05, -2)
add(sizzle(1.6), K['degrees'] - 0.6, -18)
for i in range(5): add(pop_(500 + i * 120, 0.08), K['degrees'] - 0.4 + i * 0.12, -18)
# ---- dust around the planet
add(whoosh(1.6, 150, 800, 0.4), K['dust'] - 0.3, -12); add(rumble(1.4, 0.01), K['dust'], -16)
# ---- the wave
add(breeze(1.0), C['waves'], -22)
add(wave(C['dino'] - K['waves'] + 0.3), K['waves'] - 0.2, -6)
add(splash(1.2), C['dino'] - 0.5, -8)
# ---- dinosaurs
add(whoosh(0.9, 300, 2000, 0.6), C['dino'], -14); add(pop_(400, 0.14), K['dinosaurs'] - 0.05, -10)
# ---- the observatory: a plan
add(beep(900), C['lab'] + 0.1, -22); add(beep(1300), C['lab'] + 0.35, -22)
add(ding(1318, 0.7), K['plan'] - 0.05, -14); add(rumble(0.8, 0.03) * 0.6, K['plan'], -16)
for i in range(3): add(click(), K['plan'] + 0.1 + i * 0.2, -16)
# ---- DART
add(whoosh(0.6, 300, 3000, 0.6), C['dart'] - 0.3, -12)
add(whoosh(1.4, 400, 1800, 0.5), K['dart'] - 0.4, -18)
add(boom(1.2) * 0.8, K['asteroid'] - 0.02, -6); add(crack(), K['asteroid'], -8)
for i in range(6): add(pop_(800 + i * 100, 0.05), K['asteroid'] + 0.15 + i * 0.1, -20)
# ---- orbit tightens, 32 minutes
add(shimmer(1.0), K['shifted'] - 0.1, -16)
add(pop_(700, 0.12), K['minutes'] - 0.2, -10); add(ding(1760, 0.8), K['minutes'], -14)
# ---- the why: late vs early
add(boom(1.0) * 0.6, K['early'] - 0.32, -12)
add(whoosh(0.45, 300, 4000, 0.7), K['early'] - 0.05, -10)
add(click(), K['push'] - 0.1, -8); add(pop_(1200, 0.06), K['push'] - 0.08, -12)
add(whoosh(0.8, 1500, 400, 0.5), K['push'] + 0.1, -16); add(ding(1975, 0.9), K['enough2'], -14)
# ---- finale + subscribe CTA
add(whoosh(0.5, 2000, 6000, 0.5) * 0.6, C['fin'] - 0.1, -16)
add(shimmer(1.4), C['fin'] + 0.1, -16)
add(whoosh(0.35, 400, 3500, 0.7), K['subscribe'] + 0.1, -12)
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9)
add(click(), K['whatifs'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['whatifs'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['whatifs'] + 0.45 + i * 0.09, -20)
add(whoosh(0.4, 300, 3000, 0.5), C['loop'] - 0.25, -14); add(rumble(0.8), C['loop'], -12)
write(f"public/{T['short']}/sfx.wav", DUR)
y = bed(DUR, speech=[(s['start'], s['end']) for s in S], bpm=96, mood='tense')
write_bed(f"public/{T['short']}/bed.wav", y)
print('sfx + bed written')
