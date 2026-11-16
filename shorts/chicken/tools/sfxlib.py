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

# ---------------------------------------------------------------- v2: continuous music bed (never silent), ducked under speech
NOTE = {'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23, 'G': 392.0, 'A': 440.0, 'B': 493.88}
def _tone(f, d, harm=(1, 0.35, 0.12)):
    t = tt(d); return sum(a * np.sin(2 * np.pi * f * (i + 1) * t) for i, a in enumerate(harm))
def bed(duration, speech=(), bpm=100, mood='bright', duck_db=-7):
    """procedural light music bed: pad chords + plucked arpeggio + soft kick / shaker, bar-aligned.
    mood 'bright' (I-V-vi-IV), 'curious' (vi-IV-I-V), 'tense' (i-VI-III-VII, minor). speech = [(start, end), ...]
    sentence intervals: the bed dips by duck_db under them and comes back up in pauses (so it is never silent).
    Returns the signal (add it with add_bed / write it with write_bed)."""
    prog = {'bright': [('C', 'E', 'G'), ('G', 'B', 'D'), ('A', 'C', 'E'), ('F', 'A', 'C')],
            'curious': [('A', 'C', 'E'), ('F', 'A', 'C'), ('C', 'E', 'G'), ('G', 'B', 'D')],
            'tense': [('A', 'C', 'E'), ('F', 'A', 'C'), ('C', 'E', 'G'), ('G', 'B', 'D')]}[mood]
    beat = 60 / bpm; bar = beat * 4; n = int(SR * (duration + 0.5)); y = np.zeros(n)
    nb = int(np.ceil(duration / bar)) + 1
    for b in range(nb):
        ch = prog[b % len(prog)]; t0 = b * bar; i0 = int(t0 * SR)
        pad = sum(_tone(NOTE[c] / 2, bar, (1, 0.25)) for c in ch) / 3
        pe = np.minimum(1, tt(bar) / 0.35) * np.minimum(1, (bar - tt(bar)) / 0.35)
        seg = pad * pe * 0.5
        for e in range(8):                                  # eighth-note arpeggio pluck
            f = NOTE[ch[[0, 1, 2, 1][e % 4]]] * (2 if e % 4 == 2 else 1)
            pl = _tone(f, beat / 2, (1, 0.5, 0.2)) * np.exp(-tt(beat / 2) * 9) * 0.32
            j = int(e * beat / 2 * SR); seg[j:j + len(pl)] += pl[:len(seg) - j]
        for q in range(4):                                  # kick on 1 and 3, shaker on the off-beats
            j = int(q * beat * SR)
            if q % 2 == 0: k_ = sweep(120, 45, 0.18) * np.exp(-tt(0.18) * 18) * 0.55; seg[j:j + len(k_)] += k_[:len(seg) - j]
            sh = bp(rng.standard_normal(int(0.05 * SR)), 5000, 11000) * np.exp(-tt(0.05) * 60) * 0.12
            j2 = int((q + 0.5) * beat * SR); seg[j2:j2 + len(sh)] += sh[:len(seg) - j2]
        m = min(len(seg), n - i0)
        if m > 0: y[i0:i0 + m] += seg[:m]
    g = np.ones(n)                                          # ducking envelope
    for a, b_ in speech: g[int(max(0, a - 0.1) * SR):int((b_ + 0.05) * SR)] = 10 ** (duck_db / 20)
    ker = np.ones(int(0.18 * SR)) / int(0.18 * SR); g = np.convolve(g, ker, 'same')
    y = y * g; y[:int(0.03 * SR)] *= np.linspace(0, 1, int(0.03 * SR)); y[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))
    return y[:int(SR * duration)] / (np.abs(y).max() + 1e-9)
def write_bed(path, y, peak=0.6):
    y = y / (np.abs(y).max() + 1e-9) * peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    print('bed', round(len(y) / SR, 2), 's ->', path)
