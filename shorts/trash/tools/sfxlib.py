"""sfxlib: synthesised cartoon sound effects (numpy only). Import from a short's tools/gen_sfx.py:
    from sfxlib import *          # tt, env, lp, bp, sweep, pop_, plip, whoosh, ding, thud, gurgle, slurp, deflate,
    init(duration)                # chatter, shimmer, sizzle, splash, breeze, click ... then add(sound, at, db)
    write('public/<short>/sfx.wav')
Cue times always come from src/timing.json keys, so a re-time regenerates the sound."""
import numpy as np, wave
SR = 48000
rng = np.random.default_rng(7)
out = np.zeros(1)
def init(duration):
    global out; out = np.zeros(int(SR * (duration + 1))); return out
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
    global out
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

def click(): return bp(rng.standard_normal(int(0.02 * SR)), 1500, 7000) * np.exp(-tt(0.02) * 200)
def write(path, duration, peak=0.7):
    """trim to the composition length, peak-normalise to `peak`, write 16-bit mono wav"""
    global out
    y = out[:int(SR * duration)]; y = y / (np.abs(y).max() + 1e-9) * peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    print('sfx', round(len(y) / SR, 2), 's ->', path)
