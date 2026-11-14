"""Cue list for the Sun Short. All times are word keys from src/timing.json."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
init(DUR)
TV = K['vanished']; TF = K['dark']; S2 = S[2]['start']; RET = S[5]['end'] + 0.05
# ---- the Sun pops, light keeps travelling
add(pop_(520, 0.16), TV, -6); add(shimmer(0.9), TV + 0.05, -18)
add(pop_(1000), K['light'] - 0.05, -14)
add(ding(1568, 0.6), K['eight'] - 0.05, -14)
n = max(2, int((TF - K['eight']) / 0.5))
for i in range(n): add(click(), K['eight'] + 0.3 + i * (TF - K['eight'] - 0.5) / n, -22)      # timer ticks
add(whoosh(0.9, 300, 2500), K['so'] - 0.45, -16)
add(pop_(900, 0.12), K['keep'] - 0.1, -10); add(ding(1975, 0.5), K['keep'] + 0.05, -20)
add(pop_(700, 0.1), S2 - 0.3, -14); add(whoosh(1.0, 250, 2200), S2 - 0.4, -16)
add(pop_(1000), K['empty'] - 0.05, -13)
add(shimmer(1.1), K['gravity'] - 0.1, -17); add(pop_(1150), K['gravity'] - 0.05, -13)
# ---- dark, straight line
add(thud(80, 0.45), TF, -6); add(ding(880, 0.8), TF + 0.02, -15)
add(whoosh(1.1, 200, 2600, 0.55), K['flies'] - 0.25, -10)
add(pop_(1000), K['straight'] - 0.05, -14); add(ding(1318, 0.6), K['thirty'] - 0.05, -15)
# ---- cold
add(whoosh(0.8, 300, 3000), K['week'] - 0.45, -15); add(pop_(1000), K['week'] - 0.05, -12); add(pop_(820), K['week'] + 0.2, -12)
d = sweep(900, 260, K['freezing'] + 0.35 - K['temperature']); add(d * env(len(d), 0.05, 0.2) * 0.6, K['temperature'] - 0.1, -17)
add(chatter(max(0.5, K['oceans'] - K['freezing'] - 0.3)), K['freezing'] + 0.1, -15)
add(sizzle(1.0), K['freeze'] - 0.1, -19)
for i in range(4): add(pop_(1500 + i * 130, 0.05), K['freeze'] + 0.1 + i * 0.16, -17)
add(pop_(900, 0.12), K['liquid'] - 0.15, -10)
for i in range(3): add(plip(1100 + i * 180), K['liquid'] + 0.25 + i * 0.22, -19)
add(ding(1318, 0.6), K['thousands'] - 0.05, -15)
add(shimmer(1.0), K['warmed'] - 0.05, -18)
# ---- everything comes back + subscribe CTA
add(pop_(700, 0.1), RET - 0.1, -13)
add(pop_(520, 0.16), RET + 0.2, -8); add(whoosh(1.2, 200, 2400, 0.5), RET, -13); add(ding(1568, 1.0), RET + 0.45, -16)
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9)
add(click(), K['more'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['more'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['whatifs'] + 0.1 + i * 0.09, -20)
write(f"public/{T['short']}/sfx.wav", DUR)
