"""qa_video.py video.mp4 : pop scan (caption band masked), loop check, loudness, audio gaps vs sentence gaps."""
import sys, json, subprocess, re, numpy as np, cv2
v = sys.argv[1]
cap = cv2.VideoCapture(v); fps = cap.get(cv2.CAP_PROP_FPS); W = int(cap.get(3)); H = int(cap.get(4))
prev = None; diffs = []; first = last = None
while True:
    ok, f = cap.read()
    if not ok: break
    if first is None: first = f.copy()
    last = f
    g = cv2.GaussianBlur(cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (270, 480)), (5, 5), 0).astype(np.float32)
    g[int(480 * 1370 / 1920):int(480 * 1640 / 1920)] = 0     # caption band
    g[int(480 * 230 / 1920):int(480 * 340 / 1920)] = 0       # tag band
    if prev is not None: diffs.append(np.abs(g - prev).mean())
    prev = g
d = np.array(diffs); n = len(d) + 1
print(f'{W}x{H} {fps:.2f} fps, {n} frames = {n / fps:.2f}s')
flags = []
for i in range(len(d)):
    lo, hi = max(0, i - 15), min(len(d), i + 16); med = np.median(d[lo:hi]) + 0.15
    if d[i] > 2.2 * med and d[i] > 0.8: flags.append((round((i + 1) / fps, 3), round(float(d[i]), 2), round(float(med), 2)))
print('pop flags (t, diff, local median):'); [print('  ', f) for f in flags]
a = cv2.resize(first, (270, 480)).astype(int); b = cv2.resize(last, (270, 480)).astype(int)
m = np.ones(a.shape[:2], bool); m[int(480 * 1370 / 1920):int(480 * 1640 / 1920)] = False
print(f'loop: first vs last mean abs diff {np.abs(a - b)[m].mean():.3f}, max {np.abs(a - b)[m].max()}')
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', v, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)
print(f'loudness: {I[-1] if I else "?"} LUFS, true peak {P[-1] if P else "?"} dBFS')
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', v, '-af', 'silencedetect=noise=-42dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
ss = re.findall(r'silence_start: ([\d.]+)', r); se = re.findall(r'silence_end: ([\d.]+)', r)
print('audio silences:', [(round(float(a), 2), round(float(b), 2)) for a, b in zip(ss, se)])
