"""Cue list + music bed for the manchineel Short. All times are word keys from src/timing.json."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
C = [S[2]['start'] - 0.15, S[5]['start'] - 0.2, S[7]['start'] - 0.12, S[8]['start'] - 0.15, S[11]['start'] - 0.15, S[12]['start'] - 0.15, S[14]['start'] - 0.15, S[16]['start'] - 0.15]
init(DUR)
def waves(a, b, db):
    d = b - a; y = bp(rng.standard_normal(int(SR * d)), 150, 1800) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.22 * tt(d)[:int(SR * d)]))
    add(y * env(len(y), 0.3, 0.3), a, db)
def steps(a, b, every, db=-21, f=160):
    n = int((b - a) / every)
    for i in range(n): add(thud(f + (i % 2) * 25, 0.06), a + i * every, db)
# ---- ambience: surf all the way through, birds by day, rain in the storm, crickets at night
waves(0, C[1], -25); waves(C[3], C[6], -25); waves(C[6], C[7], -27); waves(C[7], DUR, -25)
for a, b in [(0, C[1]), (C[3], C[6]), (C[7], DUR)]:
    for i in range(int((b - a) / 1.3)): add(ding(3000 + (i % 4) * 450, 0.08) * 0.4, a + 0.5 + i * 1.3 + rng.uniform(0, 0.4), -31)
rain = bp(rng.standard_normal(int(SR * (C[3] - C[1]))), 1200, 9000); add(rain * env(len(rain), 0.25, 0.2), C[1], -21)
add(thud(45, 1.6) * 1.0, C[1] + 0.05, -9)                                                  # thunder
add(bp(rng.standard_normal(int(SR * 1.4)), 60, 400) * env(int(SR * 1.4), 0.02, 1.1), C[1] + 0.1, -13)
for i in range(int((C[7] - C[6]) / 0.42)): add(ding(4300 + (i % 3) * 250, 0.05) * 0.5, C[6] + 0.3 + i * 0.42, -31)
for c in C: add(whoosh(0.4, 400, 3500, 0.5), c - 0.2, -19)                                 # soft whoosh on each cut
# ---- shot 1: walk to the tree, freeze on "Don't"
steps(0.6, K['dont'] - 0.3, 0.42)
add(pop_(500, 0.12), K['dont'] - 0.22, -9); add(ding(784, 0.5), K['dont'] - 0.05, -16)
# ---- shot 2: the tree
add(shimmer(1.2), K['manchineel'] - 0.1, -17)
for i in range(4): add(plip(1200 + i * 160), K['apples'] - 0.05 + i * 0.1, -17)
add(ding(1174, 0.8), K['band'] - 0.05, -14); add(whoosh(0.9, 200, 2200, 0.6), K['band'] - 0.4, -18)
# ---- shot 3: storm, sap drops
steps(C[1] + 0.2, K['shelter'] + 0.2, 0.2, -18, 190)
for i in range(6): add(plip(900 + i * 70), K['sap'] - 0.25 + i * 0.07, -17)
for i in range(8): add(plip(1700 - i * 60), K['drips'] + i * 0.14, -13)
add(sizzle(1.1), K['drips'] + 0.45, -18)
# ---- shot 4: blisters
for i in range(7): add(pop_(650 + i * 85, 0.07), K['blisters'] - 0.3 + i * 0.13, -11)
add(sizzle(0.9), K['blisters'] + 0.1, -19)
# ---- shot 5: the apple
g = sweep(120, 70, 0.5) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * tt(0.5))); add(g * env(len(g), 0.05, 0.2), K['starving'] + 0.15, -14)   # belly rumble
add(pop_(1100, 0.06), K['bite'] - 0.62, -14)                                                # pluck
cr = bp(rng.standard_normal(int(SR * 0.16)), 900, 5000) * np.exp(-tt(0.16) * 22); add(cr, K['bite'] - 0.02, -8)                    # crunch
add(ding(1568, 0.6), K['bite'] + 0.35, -17); add(shimmer(0.7), K['bite'] + 0.3, -20)
add(sizzle(1.3), K['burns'] - 0.1, -13); add(whoosh(0.6, 500, 4500, 0.3), K['burns'] - 0.25, -12)
add(thud(170, 0.12), K['burns'] + 0.2, -15)                                                 # apple hits the sand
# ---- shot 6: crab
for i in range(8): add(click() * 0.7, C[4] + 0.2 + i * 0.13, -19)
add(ding(220, 1.4), K['death'] - 0.1, -13); add(thud(70, 0.5), K['death'] - 0.05, -10)
for i in range(9): add(click(), K['death'] - 0.1 + i * 0.06, -15)
# ---- shot 7: boulder
steps(C[5] + 0.15, K['later'] + 1.1, 0.3, -24, 240)
for i in range(3): add(whoosh(0.18, 2000, 7000, 0.5), K['grab'] - 0.25 + i * 0.12, -17)     # leaf rustle
add(ding(1318, 0.4), K['grab'] + 0.2, -19)
add(sizzle(0.8), K['same'] + 0.35, -16)
add(sweep(300, 1400, 0.3) * env(int(SR * 0.3), 0.01, 0.1), K['same'] + 0.75, -13)          # shoots up
for i in range(7): add(thud(200, 0.07), K['worse'] - 0.3 + i * 0.35, -15); 
for i in range(7): add(pop_(900 + (i % 2) * 200, 0.06), K['worse'] - 0.15 + i * 0.35, -17)
# ---- shot 8: fire and smoke
add(chatter(max(0.3, K['light'] - K['night'] - 0.3)), K['night'], -17)
add(click(), K['light'] - 0.15, -9); add(whoosh(0.7, 150, 1500, 0.35), K['light'] - 0.1, -9)   # strike + catch
fire = bp(rng.standard_normal(int(SR * (C[7] - K['light']))), 300, 4000) * (0.5 + 0.5 * rng.random(int(SR * (C[7] - K['light']))) ** 6)
add(fire * env(len(fire), 0.3, 0.2), K['light'], -20)
add(whoosh(1.4, 150, 1200, 0.6), K['smoke'] - 0.3, -14); add(sizzle(1.2), K['smoke'] + 0.6, -18)
steps(K['smoke'] + 0.9, C[7], 0.45, -19)
# ---- shot 9: sit in the sand + subscribe CTA
add(thud(120, 0.2), K['sit'] - 0.05, -13); add(ding(1047, 0.9), K['sit'] + 0.1, -17)
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9)
add(whoosh(0.4, 600, 4000, 0.7), K['subscribe'] + 0.15, -20)
add(click(), K['natures'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['natures'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['warnings'] + i * 0.09, -20)
write(f"public/{T['short']}/sfx.wav", DUR)
y = bed(DUR, speech=[(s['start'], s['end']) for s in S], bpm=96, mood='curious')
write_bed(f"public/{T['short']}/bed.wav", y)
print('sfx + bed written', DUR)
