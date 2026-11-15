"""Cue list + music bed for the mosquito Short. All times are word keys from src/timing.json."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
C = [K['ignore'] - 0.1, S[1]['start'] - 0.1, S[2]['start'] - 0.1, K['single'] - 0.1, K['least'] - 0.25, S[3]['start'] - 0.1, S[4]['start'] - 0.1, K['personal'] - 0.1,
     S[5]['start'] - 0.1, K['three'] - 0.1, K['nineteen'] - 0.85, S[6]['start'] - 0.1, S[7]['start'] - 0.1, S[8]['start'] - 0.1, K['which'] - 0.15]
init(DUR)
def buzz(a, b, db, f=420, wob=0.0):
    d = b - a; n = int(SR * d); x = tt(d)[:n]
    y = (np.sin(2 * np.pi * (f + 22 * np.sin(2 * np.pi * 5 * x)) * x) + 0.5 * np.sin(2 * np.pi * 2 * f * x)) * 0.5
    add(y * env(n, 0.1, 0.15), a, db)
# ---- ambience: patio crickets/birds, lab hum
for a, b in [(0, C[2]), (C[13], DUR)]:
    for i in range(int((b - a) / 1.2)): add(ding(3300 + (i % 4) * 400, 0.07) * 0.4, a + 0.4 + i * 1.2 + rng.uniform(0, 0.4), -32)
hum = bp(rng.standard_normal(int(SR * (C[13] - C[2]))), 90, 400); add(hum * env(len(hum), 0.3, 0.3), C[2], -29)
for c in C: add(whoosh(0.4, 400, 3500, 0.5), c - 0.2, -20)                                   # soft whoosh on each cut
# ---- hook: the mosquito buzz, slap
buzz(0.2, C[0], -20, 430)
for i in range(7): add(pop_(300 + (i % 2) * 40, 0.05), 0.4 + i * 0.32, -22)
add(whoosh(0.35, 800, 4000, 0.4), K['pick'] - 0.3, -15)
add(thud(130, 0.18), K['pick'] + 0.35, -11)                                                 # slap near her cheek
add(ding(660, 0.35), K['ignore'] + 0.2, -19)
buzz(C[0], C[1], -23, 460)
add(shimmer(0.7), K['luck'] - 0.1, -22)
# ---- lab: swarm and one dot
buzz(C[3], C[4], -20, 380); add(pop_(900, 0.1), K['single'] + 0.1, -16); add(ding(988, 0.5), K['hundred'] + 0.1, -16)
buzz(C[4] + 0.1, C[5], -26, 520)
# ---- skin cross-section: droplets pop, bacteria wobble, smell puffs
for i in range(8): add(plip(900 + i * 90), K['fatty'] - 0.2 + i * 0.12, -17)
for i in range(8): add(pop_(500 + i * 40, 0.08), K['bacteria'] - 0.1 + i * 0.1, -16)
add(sizzle(1.0), K['bacteria'] + 0.6, -22)
for i in range(6): add(plip(380 + i * 50), K['bacteria'] + 0.7 + i * 0.35, -22)
add(whoosh(0.6, 200, 1800, 0.5), C[7] + 0.1, -16); buzz(C[7] + 0.1, C[8], -22, 500)
add(chatter(0.5), K['personal'] + 0.2, -24)
# ---- the 2026 study: three species, crowd
for i in range(3): add(pop_(700 + i * 150, 0.1), K['three'] - 0.05 + i * 0.22, -13)
buzz(C[9], C[10], -22, 400)
for i in range(24): add(pop_(1000 + (i % 5) * 90, 0.05), K['nineteen'] - 0.7 + i * 0.045, -23)
add(ding(1175, 0.6), K['nineteen'] + 0.1, -18)
# ---- nobody attracted all three: lands, lands, turns away + X
buzz(C[11], C[12], -22, 440)
add(thud(180, 0.08), K['nobody'] + 0.6, -19); add(thud(200, 0.08), K['nobody'] + 0.8, -19)
add(whoosh(0.5, 500, 3500, 0.4), K['nobody'] + 1.0, -17)
add(pop_(300, 0.1), K['nobody'] + 1.35, -9); add(ding(196, 0.6), K['nobody'] + 1.35, -12)
# ---- scents: three clouds, three mosquitoes
for i in range(3): add(pop_(500 + i * 120, 0.12), K['each'] + 0.1 + i * 0.25, -13); add(shimmer(0.8), K["each"] + 0.1 + i * 0.25, -22)
buzz(C[12], C[13], -22, 470)
for i in range(3): add(ding(1319 + i * 200, 0.35), K['scent'] + 0.5 + i * 0.2, -18)
# ---- ending: mosquito flies in, lands on the lemonade, Otto freezes, then back to Mia
buzz(C[13], C[14], -23, 450); buzz(C[14], K['tonight'] + 0.5, -20, 430)
add(plip(1400), K['tonight'] + 0.5, -14); add(ding(311, 0.8), K['tonight'] + 0.55, -17)
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9); add(whoosh(0.4, 600, 4000, 0.7), K['subscribe'] + 0.15, -20)
add(click(), K['facts'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['facts'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['this'] + i * 0.09, -20)
buzz(DUR - 1.7, DUR - 0.5, -22, 450)
write(f"public/{T['short']}/sfx.wav", DUR)
y = bed(DUR, speech=[(s['start'], s['end']) for s in S], bpm=100, mood='bright')
write_bed(f"public/{T['short']}/bed.wav", y)
print('sfx + bed written', DUR)
