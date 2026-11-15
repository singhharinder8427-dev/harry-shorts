"""Cue list + music bed for the only-man Short. All times are word keys from src/timing.json."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
Wt = [S[3]['start'] - 0.05, S[4]['start'] - 0.05, S[5]['start'] - 0.05, S[6]['start'] - 0.05, S[7]['start'] - 0.05, K['boys'] - 0.35, S[9]['start'] - 0.05]
init(DUR)
# ambience per place
add(breeze(Wt[1] + 0.3), 0, -25)
for i in range(int(Wt[1] / 0.9)): add(ding(3200 + (i % 4) * 400, 0.08) * 0.4, 0.5 + i * 0.9 + rng.uniform(0, 0.3), -30)      # birds
city = bp(rng.standard_normal(int(SR * (Wt[2] - Wt[1]))), 100, 900); add(city * env(len(city), 0.3, 0.3) * 0.6, Wt[1], -27)
add(breeze(Wt[3] - Wt[2]), Wt[2], -26)
for i in range(int((Wt[3] - Wt[2]) / 0.45)): add(ding(4300 + (i % 3) * 250, 0.05) * 0.5, Wt[2] + 1.5 + i * 0.45, -31)   # crickets
add(breeze(Wt[4] - Wt[3]), Wt[3], -25)
for i in range(int((Wt[4] - Wt[3]) / 0.7)): add(ding(3000 + (i % 4) * 500, 0.08) * 0.4, Wt[3] + 0.3 + i * 0.7, -30)
hum = sweep(55, 55, Wt[5] - Wt[4]) * 0.5; add(hum * env(len(hum), 0.2, 0.2), Wt[4], -26)
add(breeze(DUR - Wt[6]), Wt[6], -25)
for w in Wt: add(whoosh(0.55, 300, 4000, 0.5), w - 0.27, -11)
# street
add(pop_(900, 0.08), K['ray'] + 0.1, -16)
for i in range(5): add(pop_(700 + i * 90, 0.07), K['gone'] + i * 0.12, -14)
add(ding(988, 0.4), K['gone'] + 0.6, -20)
add(shimmer(1.2), K['big'] - 0.1, -14); add(pop_(1200, 0.1), K['big'] - 0.05, -10)
for i in range(6): add(ding(1800 + i * 200, 0.2) * 0.6, K['big'] + i * 0.08, -20)
y = sweep(500, 300, 0.6, 'saw'); add(bp(y, 300, 2000) * env(len(y), 0.05, 0.2), K['big'] + 0.35, -24)   # cat yawn
for i in range(5): add(thud(150, 0.07), Wt[0] + 0.1 + i * 0.21, -20)   # footsteps
add(whoosh(0.4, 800, 3000, 0.6), K['impressed'] - 0.1, -20)
# NYC
for i in range(49): add(pop_(600 + (i % 7) * 70, 0.04) * 0.7, K['lost'] - 0.1 + ((i * 37) % 50) / 50 * 1.3, -20)
add(plip(1600), K['lost'] + 0.25, -16); add(ding(1318, 0.5), K['two'] - 0.05, -16)
for i in range(3): add(ding(800, 0.15) * 0.5, Wt[1] + 0.5 + i * 0.25, -28)   # siren blips
# dusk road
for i in range(int((K['fast'] - Wt[2]) / 0.3)): add(click() * 0.5, Wt[2] + 0.2 + i * 0.3 + rng.uniform(0, 0.1), -18)   # sparks
add(ding(1318, 0.5), K['electricians'] - 0.05, -16)
add(pop_(500, 0.1), K['toolbox'] - 0.05, -12); add(thud(220, 0.12), K['toolbox'] + 0.1, -16)
for i in range(10): add(ding(1500 + i * 60, 0.2) * 0.6, K['fast'] + i * 0.09, -20)
# Rwanda
for i in range(3): add(pop_(900 + i * 100, 0.08), K['parliament'] - 0.2 + i * 0.18, -14)
add(ding(1568, 0.5), K['working'] - 0.05, -16)
# freezer
add(click(), K['frozen'] - 0.15, -10); add(whoosh(0.8, 2000, 9000, 0.3), K['frozen'], -16); add(shimmer(1.4) * 0.6, K['frozen'] + 0.2, -20)
add(ding(1318, 0.5), K['decades'] - 0.05, -16)
# nursery
for i in range(3): add(pop_(1100 + i * 120, 0.09), K['boys'] - 0.1 + i * 0.15, -12)
for i in range(12): add(click() * 0.4, K['year'] - 1.5 + i * 0.13, -20)
add(ding(2093, 0.6), K['year'] + 0.1, -16)
# end
add(whoosh(0.5, 300, 1500), K['special'] - 0.05, -16)
for i in range(3): add(ding(2400 - i * 300, 0.15), K['special'] + 0.55 + i * 0.12, -16)   # crown clank
add(deflate(0.5) * 0.6, K['special'] + 0.1, -18)
add(whoosh(0.5, 500, 3000), K['good'] + 0.35, -16)
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9); add(whoosh(0.4, 600, 4000, 0.7), K['subscribe'] + 0.15, -20)
add(click(), K['whatifs'] - 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['whatifs'] + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['whatifs'] + 0.2 + i * 0.09, -20)
write(f"public/{T['short']}/sfx.wav", DUR)
write_bed(f"public/{T['short']}/bed.wav", bed(DUR, [(s['start'], s['end']) for s in S], bpm=100, mood='bright'))
