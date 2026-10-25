import json, subprocess, re, sys
AUDIO = sys.argv[1] if len(sys.argv) > 1 else 'ses.wav'
END = float(sys.argv[2]) if len(sys.argv) > 2 else 72.8
cuts = json.load(open('cuts.json'))
text = json.load(open('subtext.json'))
out = subprocess.run(['ffmpeg', '-i', AUDIO, '-af', 'silencedetect=noise=-33dB:d=0.15', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
sil = list(zip(st, en))
pauses = []
for a, z in sil:
    m = (a + z) / 2
    if pauses and m - pauses[-1] < 0.6: pauses[-1] = (pauses[-1] + m) / 2
    else: pauses.append(m)
def speech_start(x):
    for a, z in sil:
        if a - 0.05 <= x <= z: return z
    return x
subs = []
b = cuts['bounds']
for i, sec in enumerate(cuts['names']):
    s0, s1 = b[i], min(b[i + 1], END)
    s0 = speech_start(s0)
    inner = [p for p in pauses if s0 + 0.5 < p < s1 - 0.5]
    chunks = text[sec]
    total = sum(len(c) for c in chunks)
    import itertools
    k = len(chunks) - 1
    exp = [(s1 - s0) * len(c) / total for c in chunks]
    best, edges = None, None
    acc, guesses = 0, []
    for c in chunks[:-1]:
        acc += len(c); guesses.append(s0 + (s1 - s0) * acc / total)
    cands = sorted(set([round(p, 3) for p in inner] + [round(g, 3) for g in guesses]))
    pset = set(round(p, 3) for p in inner)
    if len(cands) >= k:
        for comb in itertools.combinations(cands, k):
            e = [s0, *comb, s1]
            if min(e[j + 1] - e[j] for j in range(len(chunks))) < 0.8: continue
            sc = sum((e[j + 1] - e[j] - exp[j]) ** 2 for j in range(len(chunks))) + sum(1.2 for c in comb if c not in pset)
            if best is None or sc < best: best, edges = sc, list(e[:-1])
    if edges is None:
        acc, edges = 0, [s0]
        for c in chunks[:-1]:
            acc += len(c); edges.append(s0 + (s1 - s0) * acc / total)
    edges.append(s1)
    for c, a, z in zip(chunks, edges, edges[1:]):
        subs.append([round(a, 2), round(z, 2), c])
json.dump(subs, open('subs.json', 'w'), ensure_ascii=False, indent=0)
for s in subs: print(s)
