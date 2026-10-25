import wave, numpy as np, json, re, subprocess, sys
cfg = json.load(open(sys.argv[1]))  # {"src","dst","bounds":[section split times, orig], "notes":{n1:t,...}, "inner":0.35, "edge":0.5}
src, dst = cfg['src'], cfg['dst']
out = subprocess.run(['ffmpeg', '-i', src, '-af', 'silencedetect=noise=-35dB:d=0.3', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
sil = []
for a, z in zip(st, en):
    if sil and a - sil[-1][1] < 0.05: sil[-1][1] = z
    else: sil.append([a, z])
w = wave.open(src); sr = w.getframerate(); data = np.frombuffer(w.readframes(w.getnframes()), np.int16); w.close()
dur = len(data) / sr
keep, cur = [], 0.0
for a, z in sil:
    if a < 0.05 or z > dur - 0.05: continue
    target = cfg['edge'] if any(a - 0.1 <= b <= z + 0.1 for b in cfg['bounds']) else cfg['inner']
    if z - a <= target: continue
    ca, cz = a + target / 2, z - target / 2
    keep.append((cur, ca)); cur = cz
keep.append((cur, dur))
segs, new, pieces = [], 0.0, []
for a, z in keep:
    segs.append([a, z, new]); new += z - a; pieces.append(data[int(a * sr):int(z * sr)])
w = wave.open(dst, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.concatenate(pieces).tobytes()); w.close()
def m(t):
    for a, z, n in segs:
        if t <= z: return n + max(0, t - a)
    return new
res = {'duration': round(new, 2), 'bounds': [0] + [round(m(b), 2) for b in cfg['bounds']] + [round(new + 0.6, 2)],
       'notes': {k: round(m(v), 2) for k, v in cfg['notes'].items()}}
json.dump(res, open('mapped.json', 'w'), indent=1)
print(json.dumps(res))
