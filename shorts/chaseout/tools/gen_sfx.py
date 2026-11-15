"""Cue list + music bed for the chase-out room Short. All times are word / chunk keys from src/timing.json."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfxlib import *
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']; CHS = T['chunks']
CH = lambda i: CHS[i]['start'] - 0.12
init(DUR)
OFFICE = [(0, CH(2)), (CH(14), CH(16)), (CH(17), CH(19)), (CH(33), CH(38) + 0.2), (CH(38), DUR)]
ROOM = [(CH(2), CH(14)), (CH(16), CH(17)), (CH(19), CH(29))]
def hum(a, b, db, f=60):
    d = b - a; t = tt(d); y = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t)) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.3 * t))
    add(y * env(len(y), 0.15, 0.15), a, db)
def murmur(a, b, db):
    d = b - a; y = bp(rng.standard_normal(int(SR * d)), 250, 2200) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * tt(d)[:int(SR * d)]) ** 2)
    add(y * env(len(y), 0.2, 0.2), a, db)
def typing(a, b, db=-27):
    t = a
    while t < b: add(click() * 0.8, t, db); t += 0.07 + rng.uniform(0, 0.12)
def steps(a, b, every, db=-22, f=150):
    for i in range(int((b - a) / every)): add(thud(f + (i % 2) * 20, 0.06), a + i * every, db)
def tick_(a, b, db=-21):
    t = np.ceil(a)
    while t < b: add(click() * 1.2, t, db); add(ding(2600, 0.05) * 0.4, t, db - 6); t += 1
def creak(at, db=-16, d=0.55):
    y = sweep(420, 260, d) * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * tt(d))); add(y * env(len(y), 0.05, 0.2), at, db)
# ---- ambience: office murmur + typing; the room: a thin fluorescent hum and the clock
for a, b in OFFICE: murmur(a, b, -27); typing(a + 0.2, b - 0.1)
for a, b in ROOM: hum(a, b, -30); tick_(a, b)
for c in [CH(2), CH(14), CH(16), CH(17), CH(19), CH(29), CH(30), CH(33), CH(38)]: add(whoosh(0.35, 400, 3200, 0.5), c - 0.18, -21)
# ---- 0: picture your boss / walking / to a tiny room
add(pop_(600, 0.1), 0.42, -16)                                                      # hand on the shoulder
steps(K['walking'] + 0.1, CH(2), 0.28)
creak(CH(2) + 0.05); add(thud(110, 0.15), CH(2) + 0.5, -20)
# ---- no computer / no work / clock
add(ding(523, 0.6), K['computer'] + 0.05, -19)
add(whoosh(0.3, 300, 1500, 0.4), K['work'] - 0.2, -17); add(thud(130, 0.12), K['work'] + 0.25, -15)     # drawer slides, stops
add(ding(392, 0.7), K['work'] + 0.35, -21)
add(click() * 1.6, K['clock'], -12)
# ---- the man in the corner: phone taps, lazy wave
for i in range(5): add(click() * 0.6, K['corner'] + 0.3 + i * 0.32, -22)
add(whoosh(0.4, 600, 2500, 0.5), K['feet'] + 0.1, -21)
# ---- your new job is nothing / sit here until six
add(pop_(400, 0.14), K['nothing'] - 0.05, -12); add(ding(311, 0.9), K['nothing'] + 0.05, -17)
add(sweep(900, 300, 0.45) * env(int(SR * 0.45), 0.01, 0.1), K['six'] - 0.35, -18)      # hands whizz round
add(ding(1047, 0.6), K['six'] + 0.3, -18)
# ---- holiday
add(shimmer(1.2), K['holiday'] - 0.1, -16); add(sweep(500, 900, 0.5) * env(int(SR * 0.5), 0.05, 0.2), K['holiday'] - 0.3, -20)   # stretch
# ---- staring
steps(CH(14), CH(16), 0.36, -21)
for i in range(6): add(pop_(1300 - i * 60, 0.05), K['staring'] - 0.4 + i * 0.09, -19)
add(ding(220, 1.0), K['staring'] + 0.3, -20)
# ---- the emails stop
for i in range(5): add(plip(1500 - i * 140), K['emails'] - 0.05 + i * 0.13, -16)
add(ding(330, 0.8), K['emails'] + 0.75, -19)
# ---- old desk, the photo
add(pop_(500, 0.12), K['desk'] - 0.05, -17); add(ding(659, 0.7), K['photos'] - 0.15, -16)
# ---- every friday: knock, door, the grin; again in the evening
for i in range(2): add(thud(240, 0.07), CH(19) + 0.02 + i * 0.13, -13)
creak(CH(19) + 0.15, -18); add(shimmer(0.6), K['smiling'] - 0.1, -18); add(pop_(900, 0.1), K['smiling'] + 0.2, -16)
add(sweep(300, 240, 0.4) * env(int(SR * 0.4), 0.01, 0.2), K['enjoying'] - 0.1, -20)   # nervous gulp
for i in range(2): add(thud(240, 0.07), CH(22) + 0.02 + i * 0.13, -14)
add(ding(1175, 0.4), CH(22) + 0.35, -19)
# ---- years / feet up
for i in range(4): add(ding(880 + i * 110, 0.3) * 0.7, K['years'] - 0.1 + i * 0.08, -21)
add(thud(150, 0.1), K['feet2'] + 0.15, -15); add(thud(170, 0.1), K['feet2'] + 0.28, -16); add(ding(784, 0.6), K['feet2'] + 0.4, -20)
# ---- monday: empty chair, cleared desk
creak(CH(26) + 0.05, -18); steps(CH(26) + 0.4, CH(27), 0.3, -22)
add(ding(196, 1.4), K['empty'] - 0.05, -14)
add(sweep(700, 180, 0.9) * env(int(SR * 0.9), 0.02, 0.4), K['cleared'] - 0.05, -15)   # face drains
# ---- in japan: city air; firing: slip at the locks
murmur(CH(29), CH(30), -24); add(whoosh(0.8, 200, 1500, 0.5), CH(29), -20)
steps(CH(29), K['firing'] - 0.1, 0.32, -21)
add(whoosh(0.3, 800, 4000, 0.6), K['firing'] - 0.05, -18)
lk = CHS[31]['start'] - 0.12
add(click() * 2, lk + 0.05, -9); add(thud(300, 0.08), lk + 0.06, -12); add(click() * 2, lk + 0.4, -9); add(thud(280, 0.08), lk + 0.41, -12)   # two padlocks snap on
add(ding(247, 0.9), lk + 0.5, -18)
add(thud(320, 0.08), K['hard'] + 0.2, -16)                                          # the slip drops
add(sizzle(0.9), K['hard'] - 0.05, -18)                                             # steam
# ---- take away the work / wait / leave / the door closes
add(thud(200, 0.1), K['takeaway'] - 0.1, -14); add(whoosh(0.4, 400, 2500, 0.5), K['takeaway'] + 0.1, -17); steps(K['takeaway'] + 0.3, CHS[35]['start'], 0.3, -21)
add(sweep(1200, 200, 1.1) * env(int(SR * 1.1), 0.02, 0.3), K['wait'] - 0.15, -20)  # clock spins
tick_(K['wait'] - 0.1, K['leave'] - 0.2, -19)
steps(K['leave'] - 0.3, CH(36), 0.33, -20)
creak(K['chaseout'] - 0.5, -15, 0.7); add(thud(80, 0.4), K['chaseout'] + 0.38, -8)
# ---- subscribe
add(pop_(700, 0.12), K['subscribe'] - 0.1, -9); add(whoosh(0.4, 600, 4000, 0.7), K['subscribe'] + 0.15, -20)
add(click(), K['strange'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['strange'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['this'] + i * 0.09, -20)
write(f"public/{T['short']}/sfx.wav", DUR)
y = bed(DUR, speech=[(s['start'], s['end']) for s in S], bpm=92, mood='curious')
write_bed(f"public/{T['short']}/bed.wav", y)
print('sfx + bed written', DUR)
