"""Cue list + music bed for the last-man Short. All times are word keys from src/timing.json."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
Wt = [S[3]['start'] - 0.05, S[4]['start'] - 0.05, S[5]['start'] - 0.05, S[7]['start'] - 0.05, S[9]['start'] - 0.05]
init(DUR)
# ambience per scene (so pauses have texture)
add(breeze(Wt[0] + 0.3), 0, -24)
hum = sweep(60, 60, Wt[1] - Wt[0]) * 0.6 + sweep(120, 120, Wt[1] - Wt[0]) * 0.3; add(hum * env(len(hum), 0.3, 0.3), Wt[0], -26)
for i in range(int((Wt[2] - Wt[1]) / 0.55)): add(plip(1100 + (i % 5) * 150), Wt[1] + 0.2 + i * 0.55 + rng.uniform(0, 0.2), -24)
fl = bp(rng.standard_normal(int(SR * (Wt[3] - Wt[2]))), 80, 300); add(fl * env(len(fl), 0.3, 0.3) * 0.5, Wt[2], -28)
add(breeze(Wt[4] - Wt[3]) * 0.7, Wt[3], -26)
for i in range(int((Wt[4] - Wt[3]) / 0.4)): add(ding(4200 + (i % 3) * 300, 0.06) * 0.5, Wt[3] + 0.3 + i * 0.4, -30)   # crickets
add(breeze(DUR - Wt[4]), Wt[4], -24)
# transitions
for w in Wt: add(whoosh(0.55, 300, 4000, 0.5), w - 0.27, -11)
# highway
add(pop_(900, 0.08), K['ray'] + 0.1, -16)
y = sweep(300, 180, 0.9, 'saw'); add(bp(y, 200, 1500) * env(len(y), 0.1, 0.3), K['wakes'] + 0.15, -18)   # yawn
add(ding(988, 0.4), K['gone'] - 0.1, -18)
for i in range(6): add(thud(140, 0.08), K['traffic'] - 0.3 + i * 0.208, -18)   # footsteps
# plant
add(click(), K['down'] - 0.05, -6); add(thud(90, 0.4), K['down'], -10)
pw = sweep(400, 50, 1.0, 'saw'); add(bp(pw, 40, 1200) * env(len(pw), 0.01, 0.3), K['down'] + 0.05, -12)   # power-down
for i in range(5): add(click() * 0.6, K['nobody'] + i * 0.18, -16)
add(plip(2200), K['nobody'] + 0.15, -14)
# subway
for i in range(4): add(thud(70, 0.1), Wt[1] + 0.3 + i * 0.25, -18)
add(deflate(0.6), K['stop'], -10); add(pop_(300, 0.15), K['stop'] + 0.55, -14)
add(gurgle(K['days'] + 0.8 - K['flood'] + 0.4), K['flood'] - 0.4, -8)
add(splash(0.9), K['flood'] + 0.5, -12)
add(ding(1318, 0.5), K['days'] + 0.1, -16)
# store
for i in range(7): add(ding(1500 + i * 70, 0.12) * 0.7, K['cans'] + i * 0.06, -18)   # cans clink
add(ding(1760, 0.5), K['quality'], -16)
for i in range(5): add(ding(1200 + i * 150, 0.15), K['food'] - 0.25 + i * 0.12, -16)
for i in range(3): add(ding(2600 + i * 220, 0.4), K['food'] + 0.3 + i * 0.1, -20)
add(whoosh(0.4, 400, 3000), K['food'] - 0.35, -18)
# rooftop
add(shimmer(1.2) * 0.6, K['loneliness'] - 0.1, -20)
add(whoosh(1.4, 150, 1500, 0.5), K['cut'] - 0.1, -14)
add(pop_(600, 0.12), K['risk'] - 0.15, -12)
tk = np.concatenate([click() * 0.4 for _ in range(1)]); [add(tk, K['risk'] + i * 0.12, -20) for i in range(10)]
add(ding(988, 0.6), K['smoking'], -18)
# end
add(plip(2000), K['okay'] + 0.05, -16)
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9); add(whoosh(0.4, 600, 4000, 0.7), K['subscribe'] + 0.15, -20)
add(click(), K['whatifs'] - 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['whatifs'] + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['whatifs'] + 0.2 + i * 0.09, -20)
write(f"public/{T['short']}/sfx.wav", DUR)
write_bed(f"public/{T['short']}/bed.wav", bed(DUR, [(s['start'], s['end']) for s in S], bpm=96, mood='curious'))
