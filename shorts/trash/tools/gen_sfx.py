"""Cue list for the trash Short. Every time is a word key from src/timing.json, so a re-time regenerates the sound."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
init(DUR)
CUT1 = S[3]['start'] - 0.08; CUT3 = S[9]['start'] - 0.08
# ---- town
add(breeze(CUT1), 0, -24)
add(whoosh(0.6, 400, 3000, 0.5), 0.6, -16)          # throw
add(thud(160, 0.25), 1.6, -9); add(pop_(500, 0.08), 1.62, -16)
add(ding(1318, 0.5), K['vanish'] - 0.05, -18)
add(whoosh(1.0, 200, 2000, 0.5), K['piles'] - 0.3, -16)
for i in range(12): add(thud(120 + (i % 4) * 30, 0.14), K['piles'] - 0.15 + (i + 0.5) / 12 * 1.5, -14)
add(deflate(0.45) * 0.6, K['stinking'], -18)           # "ew" blat
add(sizzle(0.6), K['burn'] - 0.05, -14)
add(sizzle(CUT1 - K['burn']) * 0.8, K['burn'] + 0.4, -18)
add(whoosh(1.2, 80, 900, 0.4), K['black'] - 0.3, -10)  # smoke rumble
for i in range(3): add(thud(200, 0.12), K['black'] + 0.1 + i * 0.45, -16)   # coughs
# ---- plant
add(whoosh(0.4, 300, 3000, 0.7), CUT1 - 0.3, -16)
add(whoosh(0.5, 600, 2500), K['crane'] - 0.5, -18)
add(click(), K['crane'] + 0.05, -10); add(click(), K['crane'] + 0.3, -12)
add(whoosh(0.6, 400, 2000), K['crane'] + 0.85, -20)
add(click(), K['furnace'] + 0.05, -12)
for i in range(5): add(thud(150 + i * 20, 0.15), K['furnace'] + 0.5 + i * 0.05, -14)
add(whoosh(0.7, 100, 1200, 0.5), K['furnace'] + 0.45, -12)       # ignition
for i in range(10): add(thud(110 + (i % 3) * 40, 0.12), K['tumbles'] + 0.1 + i * 0.26, -18)
add(whoosh(1.0, 150, 2500, 0.4), K['air'] - 0.1, -12)             # air roar
add(gurgle(1.6), K['boils'] - 0.1, -12)
add(shimmer(1.0), K['steam'] - 0.2, -18); add(whoosh(0.8, 1500, 6000, 0.3), K['steam'] - 0.1, -16)
spin = sweep(80, 420, 1.4, 'saw'); add(lp(spin, 0.2) * env(len(spin), 0.2, 0.5), K['turbine'] - 0.35, -18)
z = bp(rng.standard_normal(int(0.3 * SR)), 2500, 9000) * env(int(0.3 * SR), 0.01, 0.15); add(z, K['power'] - 0.05, -14); add(ding(1760, 0.6), K['power'] + 0.5, -16)
for i in range(3): add(ding(1318 + i * 220, 0.4), K['leftover'] + 0.4 + i * 0.1, -20)
add(whoosh(1.0, 300, 2500), K['homes'] - 0.1, -16)
add(sizzle(0.5) * 0.7, K['lime'], -18)
for i in range(6): add(pop_(1600 + i * 80, 0.05), K['acid'] + i * 0.1, -18)
for i in range(5): add(plip(900 + i * 60), K['carbon'] + 0.35 + i * 0.12, -18)
add(pop_(500, 0.15), K['bags'] - 0.1, -12)
add(thud(220, 0.15), K['dust'], -16)
add(whoosh(1.0, 300, 2500), K['dust'] + 0.25, -16)
add(whoosh(0.6, 200, 1500, 0.3), K['plume'] - 0.15, -12); add(pop_(400, 0.15), K['plume'] - 0.1, -12)
add(ding(1568, 0.5), K['vapor'], -18)
add(whoosh(1.1, 200, 3000, 0.5), K['vapor'] + 0.15, -12)
add(thud(300, 0.2), K['magnets'] + 0.05, -12)
for i in range(6): add(ding(2600 + i * 90, 0.15), K['magnets'] + 0.4 + i * 0.32, -22)
add(breeze(CUT3 - K['rest']) * 0.6, K['rest'], -24)
add(ding(1318, 0.6), K['gravel'], -16)
# ---- subscribe CTA
add(whoosh(0.4, 300, 3000, 0.7), CUT3 - 0.3, -16)
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9)
add(whoosh(0.4, 600, 4000, 0.7), K['subscribe'] + 0.15, -20)
add(click(), K['everyday'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['everyday'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['work'] - 0.05 + i * 0.09, -20)
write(f"public/{T['short']}/sfx.wav", DUR)
