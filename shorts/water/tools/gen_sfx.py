"""Synthesised sound effects mixed at cue times from src/timing.json -> public/water/sfx.wav (48 kHz mono).
Re-run after every re-time: all cues are word keys."""
import json, numpy as np, wave
SR = 48000
T = json.load(open('src/timing.json')); K = T['keys']; S = T['sentences']; DUR = T['duration']
CUT1 = K['you'] - 0.04; CUT2 = S[4]['start'] - 0.08
LV0 = K['oceans'] + 0.3; LV1 = max(K['basins'] + 0.95, LV0 + 1.3)
rng = np.random.default_rng(7)
out = np.zeros(int(SR * (DUR + 1)))
def tt(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.005, r=0.1):
    e = np.ones(n); ai = max(1, int(a * SR)); ri = max(1, int(r * SR))
    e[:ai] = np.linspace(0, 1, ai); e[-ri:] *= np.linspace(1, 0, ri); return e
def lp(x, a):  # one-pole low-pass, a in (0,1): smaller = darker
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def sweep(f0, f1, d, shape='sin'):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if shape == 'sin' else 2 * ((ph / (2 * np.pi)) % 1) - 1
def add(x, at, db=0):
    i = int(at * SR)
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), len(out) - i)
    if n > 0: out[i:i + n] += x[:n] * 10 ** (db / 20)
def pop_(f=900, d=0.09): t = tt(d); return sweep(f, f * 0.45, d) * np.exp(-t * 40)
def plip(f=1400): t = tt(0.12); return sweep(f * 0.6, f * 1.6, 0.12) * np.exp(-t * 30)
def whoosh(d=0.7, lo=300, hi=3000, peak=0.6):
    n = rng.standard_normal(int(SR * d)); x = bp(n, lo, hi); t = tt(d)
    e = np.where(t < peak * d, (t / (peak * d)) ** 2, np.exp(-(t - peak * d) * 9)); return x * e / (np.abs(x).max() + 1e-9)
def ding(f=1320, d=0.9): t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 5) * env(len(t), 0.002, 0.05)
def thud(f=90, d=0.3): t = tt(d); return sweep(f * 1.8, f, d) * np.exp(-t * 14)
def gurgle(d):
    x = np.zeros(int(SR * d))
    for _ in range(int(d * 28)):
        at = rng.uniform(0, d - 0.08); b = sweep(rng.uniform(250, 600), rng.uniform(700, 1400), 0.06) * np.exp(-tt(0.06) * 35)
        i = int(at * SR); x[i:i + len(b)] += b * rng.uniform(0.3, 1)
    rum = lp(rng.standard_normal(len(x)), 0.01) * 6; t = tt(d)
    return (x * 0.6 + rum) * np.sin(np.pi * t / d) ** 0.6
def slurp(d=0.9):
    t = tt(d); x = sweep(700, 160, d) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * t)); n = bp(rng.standard_normal(len(t)), 200, 1500)
    return (x * 0.7 + n * 0.25) * env(len(t), 0.03, 0.25)
def deflate(d=0.5):
    t = tt(d); x = sweep(900, 140, d, 'saw') * (0.7 + 0.3 * np.sin(2 * np.pi * 30 * t))
    return lp(x, 0.25) * env(len(t), 0.01, 0.1) * 1.6
def chatter(d):
    x = np.zeros(int(SR * d))
    for k in range(int(d * 16)):
        c = bp(rng.standard_normal(int(0.012 * SR)), 1500, 5000) * np.exp(-tt(0.012) * 300); i = int(k / 16 * SR); x[i:i + len(c)] += c
    return x
def shimmer(d=1.2):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * t + i) for i, f in enumerate([880, 1108, 1318, 1760])) / 4
    return x * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t)) * env(len(t), 0.25, 0.6)
def sizzle(d):
    t = tt(d); return bp(rng.standard_normal(len(t)), 3000, 9000) * 0.5 * env(len(t), 0.3, 0.4)
def splash(d=1.1):
    t = tt(d); n = bp(rng.standard_normal(len(t)), 300, 6000); return n * np.exp(-t * 4) * env(len(t), 0.01, 0.2) + gurgle(d) * 0.3
def breeze(d):
    t = tt(d); return lp(rng.standard_normal(len(t)), 0.02) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 5.3)) * env(len(t), 1.0, 1.0) * 4

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
clk = bp(rng.standard_normal(int(0.02 * SR)), 1500, 7000) * np.exp(-tt(0.02) * 200); add(clk, K['never'] + 0.05, -6)
for i in range(3): add(ding(2093 + i * 240, 0.5), K['never'] + 0.08 + i * 0.07, -18)
for i in range(5): add(ding(2637, 0.25) * 0.8, K['next'] - 0.05 + i * 0.09, -20)
out = out[:int(SR * DUR)]
out = out / (np.abs(out).max() + 1e-9) * 0.7
with wave.open('public/water/sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('sfx', round(len(out) / SR, 2), 's')
