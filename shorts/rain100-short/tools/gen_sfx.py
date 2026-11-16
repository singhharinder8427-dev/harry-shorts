"""Cue list for the rain100 Short. Every time is a word key / chunk start from src/timing.json, so a re-time rebuilds the sound."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
CH = [c['start'] for c in T['chunks']]
cs = lambda i: CH[i] - 0.04
init(DUR)
# ---- rain ambience under everything (breeze = filtered noise), plus soft whooshes on the cuts to a new place
add(breeze(DUR), 0, -23)
for i in (3, 8, 12, 14, 25): add(whoosh(0.45, 300, 2500, 0.5), cs(i) - 0.3, -17)
for i in (1, 2, 6, 11, 13, 16, 17, 19, 22, 23): add(pop_(700, 0.07), cs(i), -20)
# ---- hook + cloud
for i in range(3): add(plip(1500 + i * 150), K['rained'] + 0.05 + i * 0.13, -14)
add(thud(70, 0.5), K['hold'] - 0.1, -10)
# ---- the jar: one inch
add(pop_(700, 0.15), CH[3] + 0.1, -9); add(ding(1568, 0.7), CH[3] + 0.35, -16)
add(shimmer(1.2), CH[4], -20)
add(plip(1800), CH[5] + 0.1, -12); add(ding(2093, 0.6), CH[5] + 0.7, -14); add(pop_(1000), CH[5] + 0.6, -12)
# ---- nine days
add(slurp(0.9), cs(6), -10)
t0 = cs(6) + 0.5; st = (K['nine'] + 0.7 - t0) / 9
for i in range(9): add(pop_(900 * 2 ** (i / 12), 0.08), t0 + i * st, -13); add(plip(1300 + i * 80), t0 + i * st + 0.05, -20)
# ---- oceans lift it back up
add(shimmer(1.4), K['oceans'] - 0.2, -17)
add(whoosh(0.9, 200, 2000, 0.5), K['lift'] - 0.1, -13)
for i in range(3): add(pop_(800 + i * 100, 0.08), K['again'] + i * 0.28, -17)
# ---- forty refills
for i in range(40): add(plip(900 + 25 * i), cs(13) + 0.25 + i * 0.05, -22)
add(ding(1568, 0.9), K['forty'], -15)
# ---- three and a half feet
fl = CH[15] - 0.1; add(gurgle(1.7), fl, -9); add(whoosh(1.5, 150, 1500, 0.45), fl, -17)
add(thud(120, 0.3), K['feet'], -10); add(ding(1318, 0.8), K['feet'] + 0.2, -15)
# ---- century: tower of year blocks, then the tank
for i in range(50): add(pop_(500 + 12 * i, 0.04), cs(16) + 0.15 + i * 0.022, -22)
add(thud(90, 0.4), cs(16) + 1.3, -9); add(whoosh(0.8, 200, 3000, 0.5), cs(16) + 0.2, -15)
add(sizzle(CH[19] - cs(17) + 0.2), cs(17), -20)
add(gurgle(CH[19] - cs(17)), cs(17), -12)
add(ding(1760, 0.9), K['thousand'] + 0.1, -14)
# ---- 340 feet deep
add(gurgle(CH[21] - cs(19)), cs(19), -8); add(whoosh(CH[21] - cs(19), 120, 1800, 0.5), cs(19), -15)
add(thud(80, 0.5), K['deep'], -8); add(ding(988, 1.0), K['deep'] + 0.05, -14)
add(whoosh(1.0, 300, 3000, 0.5), CH[21] - 0.1, -15)
# ---- the turn: supply -> loop
add(pop_(1000, 0.1), K['supply'], -10); add(ding(1318, 0.7), K['supply'] + 0.1, -18)
add(shimmer(1.6), K['loop'], -15); add(ding(1568, 1.2), K['sun'], -13)
# ---- subscribe CTA
add(pop_(700, 0.12), K['subscribe'], -9)
add(whoosh(0.4, 600, 4000, 0.7), K['subscribe'] + 0.12, -20)
add(click(), K['whatif'], -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['whatif'] + 0.04 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['whatif'] + 0.5 + i * 0.09, -21)
write(f"public/{T['short']}/sfx.wav", DUR)
# ---- music bed that ducks under each sentence
y = bed(DUR, speech=[(s['start'], s['end']) for s in S], bpm=92, mood='curious')
write_bed(f"public/{T['short']}/bed.wav", y)
print('sfx + bed written')
