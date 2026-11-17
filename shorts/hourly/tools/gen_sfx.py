"""Sound cues for "$20 an hour to $1 million" (every cue on a word key from src/timing.json, so a re-time regenerates it).
Also writes the continuous music bed (bed.wav)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
init(DUR)
LOOP = DUR - 0.42
def steps(a, b, rate, db=-22, f=150):            # treadmill footfalls (soft thuds)
    t = a
    while t < b: add(thud(f, 0.12), t, db); t += 1 / rate
def plinks(at, n, gap=0.11, db=-14):              # coins hitting coins
    for i in range(n): add(plip(2600 + 220 * (i % 3)), at + i * gap, db); add(ding(3520 + 180 * (i % 4), 0.25) * 0.6, at + i * gap + 0.01, db - 6)
# ---- hook: running, clock ticking fast, bills popping out
steps(0.0, K['million'] - 0.25, 4.8)
for i in range(int((K['million'] - 0.25) / 0.25)): add(click(), 0.05 + i * 0.25, -20)
for i in range(3): add(whoosh(0.35, 700, 4000, 0.5), 0.3 + i * 0.83, -22)
# ---- jar: one lonely bill flutters down
add(whoosh(0.6, 300, 2200, 0.5), K['million'] - 0.1, -16); add(pop_(500, 0.08), K['million'] + 0.5, -16)
add(pop_(900), K['million'] + 0.1, -12)
# ---- bar 1 rises + counter
add(sweep(220, 660, 0.55) * env(int(0.55 * SR), 0.02, 0.15), K['twentyfour'] - 0.12, -16); add(ding(1568, 0.6), K['twentyfour'] + 0.55, -14)
# ---- full time: clock spin
for i in range(14): add(click(), K['full'] - 0.05 + i * 0.075, -18)
add(pop_(1000), K['full'] + 0.1, -12)
steps(K['full'] - 0.3, K['cent'] - 0.35, 4.8, -24)
# ---- every cent: coins into the jar
plinks(K['cent'] + 0.15, 6, 0.13, -12)
# ---- taxes: coins scooped away, bar 2
add(whoosh(0.5, 400, 3000), K['taxes'] + 0.05, -14); plinks(K['taxes'] + 0.1, 4, 0.06, -18)
add(sweep(220, 700, 0.5) * env(int(0.5 * SR), 0.02, 0.15), K['twentyeight'] - 0.1, -16); add(ding(1760, 0.6), K['twentyeight'] + 0.5, -14)
add(pop_(800, 0.07), K['taxes'] + 0.15, -18)
# ---- pie: big slice slides away, 20% pops
add(whoosh(0.7, 200, 1800, 0.5), K['rent'] - 0.05, -14); add(thud(90, 0.3), K['save'] + 0.35, -14)
add(pop_(1100), K['percent'], -10); add(ding(1318, 0.5), K['percent'] + 0.05, -18)
# ---- 140: bar rockets up, camera slam
add(sweep(180, 1400, 0.75) * env(int(0.75 * SR), 0.01, 0.2), K['hundred'], -12)
add(whoosh(0.5, 300, 5000, 0.55), K['forty'] - 0.1, -12); add(thud(70, 0.4), K['forty'] + 0.3, -8); add(ding(988, 0.9), K['forty'] + 0.32, -16)
# ---- prices double: tag flip
add(whoosh(0.25, 1500, 6000, 0.5), K['double'] - 0.12, -16); add(pop_(700, 0.12), K['double'] + 0.1, -10)
for i in range(3): add(pop_(500 - i * 80, 0.06), K['double'] + 0.25 + i * 0.1, -18)
# ---- rigged: belt speeds up (faster steps, motor whine), then the hard stop
steps(K['rigged'] - 0.35, K['isnt'] - 0.05, 7.5, -20)
mot = sweep(180, 420, K['isnt'] - K['rigged'] + 0.2) * 0.25; add(mot * env(len(mot), 0.2, 0.05), K['rigged'] - 0.3, -22)
add(thud(60, 0.5), K['isnt'] - 0.05, -6); add(whoosh(0.3, 2000, 7000, 0.3), K['isnt'] - 0.1, -18)
# ---- wrong equation: slam + stamp
add(whoosh(0.35, 300, 3500, 0.7), K['wrong'] - 0.3, -14); add(thud(110, 0.25), K['wrong'] - 0.02, -9)
add(thud(80, 0.3), K['equation'] + 0.32, -6); add(pop_(400, 0.15), K['equation'] + 0.34, -12)
# ---- bars rise into the ceiling
add(sweep(200, 600, 0.6) * env(int(0.6 * SR), 0.02, 0.15), K['salary'], -18); add(sweep(250, 650, 0.5) * env(int(0.5 * SR), 0.02, 0.15), K['rate'] - 0.1, -18)
add(whoosh(0.5, 200, 1500, 0.8), K['ceiling'] - 0.45, -16); add(thud(140, 0.25), K['ceiling'], -8); add(ding(660, 0.4) * 0.6, K['ceiling'] + 0.02, -18)
# ---- other equation: bulb, people pop in
add(pop_(1000), K['other'] + 0.05, -12); add(shimmer(0.9), K['problems'] - 0.05, -14); add(ding(2093, 0.6), K['problems'], -16)
for i in range(12): add(pop_(900 + 40 * i, 0.06), K['people'] - 0.1 + i * 0.09, -18)
# ---- no ceiling: shatter + rocket
add(splash(1.0) * 0.6, K['noceiling'] - 0.03, -12)
for i in range(10): add(ding(3000 + 260 * i, 0.3) * 0.5, K['noceiling'] + i * 0.05, -20)
add(sweep(200, 1600, 0.6) * env(int(0.6 * SR), 0.01, 0.15), K['noceiling'] - 0.1, -14)
add(whoosh(0.5, 300, 4000), K['noceiling'] + 0.05, -14)
# ---- yoga: soft chime, $100/hr, one coin, camera beep, whip, the hall + coin rain
add(whoosh(0.5, 200, 1800, 0.5), K['yoga'] - 0.35, -18); add(ding(784, 1.0) * 0.7, K['yoga'], -18)
add(pop_(1000), K['hundred2'] - 0.05, -12); plinks(K['sells'] + 0.45, 1, 0.1, -12)
add(ding(1760, 0.2), K['film'] + 0.3, -16); add(ding(1760, 0.2), K['film'] + 0.5, -16)
add(whoosh(0.45, 300, 5000, 0.5), K['film'] - 0.15, -12)
add(whoosh(0.4, 500, 6000, 0.6), K['thousands'] - 0.4, -14); add(thud(90, 0.3), K['thousands'] - 0.12, -12)
add(chatter(1.4) * 0.6, K['thousands'], -22); plinks(K['thousands'] + 0.3, 14, 0.07, -16)
# ---- finale: shimmer, two slams, sparkle on the half
add(shimmer(1.2), K['game'] - 0.2, -16)
add(whoosh(0.35, 300, 5000, 0.6), K['game'] + 0.85, -12); add(thud(110, 0.2), K['game'] + 1.15, -12)
add(whoosh(0.35, 300, 5000, 0.6), K['half'] - 0.6, -12); add(thud(110, 0.2), K['half'] - 0.3, -12)
add(pop_(900), K['half'] - 0.1, -12); add(shimmer(0.9), K['half'] + 0.05, -16)
# ---- subscribe CTA
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9); add(whoosh(0.4, 600, 4000, 0.7), K['subscribe'] + 0.15, -20)
add(click(), K['otherhalf'] - 0.25, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['otherhalf'] - 0.22 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['otherhalf'] + 0.2 + i * 0.09, -20)
# ---- loop: back to the treadmill
add(whoosh(0.3, 2000, 7000, 0.4), LOOP - 0.15, -18); steps(LOOP, DUR - 0.02, 4.8, -24)
write(f"public/{T['short']}/sfx.wav", DUR)
y = bed(DUR, speech=[(s['start'], s['end']) for s in S], bpm=100, mood='curious')
write_bed(f"public/{T['short']}/bed.wav", y)
print('sfx + bed written')
