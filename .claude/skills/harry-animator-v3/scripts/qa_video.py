"""qa_video.py video.mp4 : first-frame report (17 Nov amendment), pop scan (caption band masked), loop check, loudness,
audio gaps vs sentence gaps."""
import os
import sys, json, subprocess, re, numpy as np, cv2
v = sys.argv[1]
cap = cv2.VideoCapture(v); fps = cap.get(cv2.CAP_PROP_FPS); W = int(cap.get(3)); H = int(cap.get(4))
prev = None; diffs = []; first = last = None; early = []
while True:
    ok, f = cap.read()
    if not ok: break
    if first is None: first = f.copy()
    if len(early) <= round(fps * 0.2): early.append(f.copy())
    last = f
    g = cv2.GaussianBlur(cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (270, 480)), (5, 5), 0).astype(np.float32)
    g[int(480 * 1140 / 1920):int(480 * 1340 / 1920)] = 0     # caption box (v2 safe area)
    g[int(480 * 230 / 1920):int(480 * 340 / 1920)] = 0       # tag band
    if prev is not None: diffs.append(np.abs(g - prev).mean())
    prev = g
d = np.array(diffs); n = len(d) + 1
print(f'{W}x{H} {fps:.2f} fps, {n} frames = {n / fps:.2f}s')
flags = []
for i in range(len(d)):
    lo, hi = max(0, i - 15), min(len(d), i + 16); med = np.median(d[lo:hi]) + 0.15
    if d[i] > 2.2 * med and d[i] > 0.8: flags.append((round((i + 1) / fps, 3), round(float(d[i]), 2), round(float(med), 2)))
# --- first frame (17 Nov amendment): bright, uncluttered, already moving. Hook-text zone and caption box are masked.
# Calibrated on earlier Shorts: chicken (moving, a bit busy), trash (moving) pass; lastman / manchineel (standing still)
# and water (dark space, still) fail.
def _g(f): return cv2.cvtColor(cv2.resize(f, (270, 480)), cv2.COLOR_BGR2GRAY)
Y = _g(first); fm = np.ones(Y.shape, bool)
fm[int(480 * 250 / 1920):int(480 * 700 / 1920)] = False; fm[int(480 * 1140 / 1920):int(480 * 1340 / 1920)] = False
luma, dark = Y.mean(), (Y < 50).mean() * 100
edges = (cv2.Canny(cv2.GaussianBlur(Y, (3, 3), 0), 60, 160) > 0)[fm].mean() * 100
moving = (np.abs(_g(early[-1]).astype(np.float32) - Y.astype(np.float32)) > 12)[fm].mean() * 100
ok = lambda c, w=False: 'OK' if c else ('CHECK' if w else 'FIX')
print('first frame:')
print(f'   brightness: mean luma {luma:.0f}, dark px {dark:.0f}% -> {ok(luma >= 110 and dark <= 25)} (want luma >= 110, dark <= 25%)')
print(f'   clutter: edge density {edges:.1f}% -> {ok(edges <= 4, edges <= 6)} (want <= 4%; 4-6% look again; > 6% too busy)')
print(f'   motion 0-0.2 s: {moving:.1f}% of px change -> {ok(moving >= 1.5, moving >= 0.5)} (want >= 1.5%: Blob mid-action, the strange thing moving)')
os.makedirs('qa', exist_ok=True); cv2.imwrite('qa/frame0_phone.png', cv2.resize(first, (216, 384), interpolation=cv2.INTER_AREA))
print('   saved qa/frame0_phone.png (phone-feed size): Blob mid-action? strange thing visible? hook text readable?')
print('pop flags (t, diff, local median):'); [print('  ', f) for f in flags]
a = cv2.resize(first, (270, 480)).astype(int); b = cv2.resize(last, (270, 480)).astype(int)
m = np.ones(a.shape[:2], bool); m[int(480 * 1140 / 1920):int(480 * 1340 / 1920)] = False
print(f'loop: first vs last mean abs diff {np.abs(a - b)[m].mean():.3f}, max {np.abs(a - b)[m].max()}')
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', v, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)
print(f'loudness: {I[-1] if I else "?"} LUFS, true peak {P[-1] if P else "?"} dBFS')
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', v, '-af', 'silencedetect=noise=-42dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
ss = re.findall(r'silence_start: ([\d.]+)', r); se = re.findall(r'silence_end: ([\d.]+)', r)
sil = [(round(float(a), 2), round(float(b), 2)) for a, b in zip(ss, se)]
print('audio silences (v2 target: none - the bed is continuous):', sil)
print('targets: loudness about -14 LUFS (after master_audio.py), true peak <= -1 dBTP')
