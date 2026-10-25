import wave, numpy as np, json, re, subprocess
src, dst = 'ses2.wav', 'ses2c.wav'
out = subprocess.run(['ffmpeg', '-i', src, '-af', 'silencedetect=noise=-35dB:d=0.4', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
sil = []
for a, z in zip(st, en):
    if sil and a - sil[-1][1] < 0.05: sil[-1][1] = z
    else: sil.append([a, z])
BOUND = [6.49, 20.98, 34.97, 47.50, 63.36, 78.44, 86.17]  # section ends (silence starts)
w = wave.open(src); sr = w.getframerate(); data = np.frombuffer(w.readframes(w.getnframes()), np.int16); w.close()
dur = len(data) / sr
keep, segs, t = [], [], 0.0
cur = 0.0
for a, z in sil:
    if a < 0.05 or z > dur - 0.05: continue
    target = 0.6 if any(abs(a - b) < 0.1 for b in BOUND) else 0.5
    if z - a <= target: continue
    cut_a, cut_z = a + target / 2, z - target / 2
    keep.append((cur, cut_a)); cur = cut_z
keep.append((cur, dur))
new, pieces = 0.0, []
for a, z in keep:
    segs.append([a, z, new]); new += z - a
    pieces.append(data[int(a * sr):int(z * sr)])
w = wave.open(dst, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.concatenate(pieces).tobytes()); w.close()
json.dump(segs, open('timemap.json', 'w'))
def m(t):
    for a, z, n in segs:
        if t <= z: return n + max(0, t - a)
    return new
print('new duration', round(new, 2))
marks = {'intro_end': 6.85, 'n1': 7.21, 'n1note': 17.19, 'n2': 22.8, 'n2note': 30.37, 'n3': 36.81, 'n3note': 44.41, 'n4': 48.40, 'n4note': 59.41, 'n5': 64.79, 'n5note': 74.55, 'soru': 79.63, 'outro': 87.61}
print({k: round(m(v), 2) for k, v in marks.items()})
