"""Example cue list (water Short). Copy to <project>/tools/gen_sfx.py and rewrite the cues for the new story.
All times are word keys from src/timing.json."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
init(DUR)
CUT1 = K['you'] - 0.04; CUT2 = S[4]['start'] - 0.08
LV0 = K['oceans'] + 0.3; LV1 = max(K['basins'] + 0.95, LV0 + 1.3)
# ---- space shot 1
add(plip(1500), K['drop'], -10)
add(slurp(0.9), K['vanished'] - 0.02, -6)
for i in range(3): add(pop_(1100 + i * 120), K['vanished'] + 0.1 + i * 0.09, -12)
add(whoosh(0.7, 200, 2500), CUT1 - 0.42, -9)
# ---- ground
add(breeze(CUT2 - CUT1), CUT1, -24)
add(plip(2000), K['survive'] + 0.1, -12)
fill = sweep(300, 900, 0.9) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * tt(0.9))); add(fill * env(len(fill), 0.05, 0.2), K['sixty'] - 0.15, -15)
add(pop_(1000), K['sixty'], -10)
add(whoosh(0.6, 300, 2500), K['person'] - 0.25, -16)
add(deflate(0.5), K['shrivel'] - 0.03, -9); add(thud(110), K['shrivel'] + 0.38, -8)
add(whoosh(1.1, 200, 2200, 0.55), K['shrivel'] + 0.75, -12)
add(gurgle(LV1 - LV0 + 0.3), LV0, -6)
add(thud(140, 0.25), LV0 + 0.45, -10)
for i in range(3): add(pop_(500, 0.05), LV1 - 0.1 + i * 0.28, -14)
add(ding(1568, 0.7), K['three'] - 0.05, -14); add(pop_(1000), K['three'], -12)
add(whoosh(0.8, 300, 3000), K['clouds'] - 0.45, -14)
for i in range(3):
    add(pop_(800 + i * 150, 0.12), K['disappear'] + 0.32 + i * 0.12, -9); add(ding(2637 + i * 200, 0.4), K['disappear'] + 0.36 + i * 0.12, -24)
# ---- space shot 2
add(whoosh(0.5, 200, 2000), CUT2 - 0.35, -14)
add(shimmer(1.3), K['vapor'] - 0.1, -16); add(pop_(1000), K['vapor'] + 0.05, -12); add(pop_(1150), K['half'] - 0.05, -12)
add(sizzle(K['without'] - K['trapper'] + 0.35), K['trapper'] - 0.35, -22)
add(pop_(600, 0.14), K['without'] + 0.05, -6)
for i in range(4): add(whoosh(0.5, 800 + i * 300, 5000, 0.4) * 0.8, K['escape'] - 0.25 + i * 0.22, -16)
add(chatter(K['strange'] - K['night'] - 0.1), K['night'], -14)
for i in range(8): add(pop_(1300 + i * 60, 0.06), K['desert'] + 0.08 + i * 0.06, -16)
add(ding(988, 0.5) * 0.7, K['strange'], -16)
for i in range(9): add(plip(1200 + i * 90), K['rolled'] + 0.55 + i * 0.07, -16)
add(pop_(900, 0.12), K['rolled'] + 0.45, -10); add(ding(1760, 0.8), K['ball'], -14)
add(ding(1318, 0.6), K['under'], -16)
for i in range(9): add(pop_(1000 * 2 ** (i / 12), 0.05), K['nine'] - 0.05 + i * 0.075, -14)
add(whoosh(0.5, 400, 3000), K['depends'] - 0.1, -14)
add(splash(1.2), K['depends'] + 0.42, -8)
for i in range(3): add(pop_(1200, 0.08), K['depends'] + 0.95 + i * 0.12, -16)
add(ding(1568, 1.0), K['depends'] + 1.2, -15)

# ---- subscribe CTA
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9)
add(whoosh(0.4, 600, 4000, 0.7), K['subscribe'] + 0.15, -20)
add(click(), K['never'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['never'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['next'] - 0.05 + i * 0.09, -20)
write(f"public/{T['short']}/sfx.wav", DUR)
