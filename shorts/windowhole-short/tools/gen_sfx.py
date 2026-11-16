"""Cue list + music bed for the window-hole Short. All times are word keys / chunk starts from src/timing.json."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']; CH = [c['start'] for c in T['chunks']]
C = [c - 0.12 for c in CH]
init(DUR)
# ---- ambience: cabin engine hum all the way through (a little higher in the sky shots)
hum = bp(rng.standard_normal(int(SR * DUR)), 60, 420) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.13 * tt(DUR)[:int(SR * DUR)])); add(hum, 0, -27)
for c in C[1:]: add(whoosh(0.35, 400, 3500, 0.5), c - 0.18, -20)                           # soft whoosh on each cut
# ---- opening: Mia points, Otto steams
add(pop_(700, 0.1), K['hole'] - 0.1, -12); add(ding(1568, 0.5), K['hole'] + 0.1, -17)
add(ding(1318, 0.7), C[1] + 0.3, -18)
add(sizzle(1.2), K['sure'] - 0.1, -17); add(thud(90, 0.25), K['mistake'] - 0.05, -14)
add(ding(1047, 0.8), K['isnt'] - 0.05, -15); add(shimmer(0.7), K['isnt'], -20)
# ---- sky: plane pass, thin air gasp
add(whoosh(1.4, 120, 1800, 0.5), C[5] + 0.1, -15)
g = sweep(520, 330, 0.5); add(g * env(len(g), 0.05, 0.3), K['thin'] - 0.3, -16)
for i in range(5): add(plip(1500 - i * 70), K['thin'] + i * 0.3, -22)
# ---- cutaways: air, arrows, panes, drill, flow, load, drops
for i in range(10): add(plip(900 + (i % 5) * 120), C[6] + 0.2 + i * 0.09, -23)
for i in range(3): add(pop_(560 + i * 130, 0.08), K['pushes'] - 0.1 + i * 0.12, -13)
for i in range(7): add(pop_(700 + (i % 3) * 120, 0.06), C[8] + 0.3 + i * 0.2, -19)
for i in range(3): add(thud(160 + i * 15, 0.08), K['panes'] - 0.2 + i * 0.12, -13)
add(whoosh(0.6, 300, 3000, 0.5), K['panes'] - 0.25, -15)
dr = bp(rng.standard_normal(int(SR * 0.55)), 700, 6000) * (0.6 + 0.4 * np.sin(2 * np.pi * 70 * tt(0.55)[:int(SR * 0.55)])); add(dr * env(len(dr), 0.05, 0.15), K['drilled'] - 0.3, -15)
add(pop_(300, 0.15), K['drilled'] + 0.2, -9); add(ding(1760, 0.6), K['drilled'] + 0.25, -16)
for i in range(9): add(plip(1100 + i * 40), K['lets'] + i * 0.2, -19)
for i in range(3): add(thud(110 + i * 20, 0.1), K['load'] - 0.5 + i * 0.1, -14)
add(ding(1175, 0.9), K['outer'] + 0.05, -15); add(sizzle(0.9), K['outer'] + 0.1, -22)
for i in range(10): add(plip(2000 - i * 55), K['moisture'] - 0.1 + i * 0.17, -19)
# ---- fog contrast, Otto leans in and goes quiet, Mia smiles
add(sizzle(1.4), K['fog'] - 0.4, -23); add(ding(1568, 0.7), K['fog'] + 0.9, -17)
add(whoosh(0.5, 200, 1500, 0.4), K['leans'] - 0.1, -17)
add(pop_(500, 0.1), K['quiet'] - 0.7, -17); add(thud(70, 0.3), K['quiet'] - 0.1, -17)
add(ding(1318, 0.7), K['smiles'] + 0.05, -16); add(shimmer(0.8), K['smiles'] + 0.1, -20)
# ---- subscribe CTA
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9)
add(click(), K['strange'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['strange'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['fact'] + i * 0.09, -20)
write(f"public/{T['short']}/sfx.wav", DUR)
y = bed(DUR, speech=[(s['start'], s['end']) for s in S], bpm=100, mood='bright')
write_bed(f"public/{T['short']}/bed.wav", y)
print('sfx + bed written', DUR)
