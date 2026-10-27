"""Ada kliplerini taban üstüne yerleştir, üst katmanı ekle, efekt sesleri + müzik üret.
Kullanım: python3 finish.py <prefix>   (okur: <prefix>.json, <prefix>_base.mp4, <prefix>_top.mov)"""
import json, sys, subprocess, wave
import numpy as np
P = sys.argv[1]
S = json.load(open(f'{P}.json'))
D = S['duration']
A = '/home/claude/uzun/alpha'
X, Y, HH = S.get('adaPos', [-60, 870, 1050])
segs = S['ada']
inp = ['-i', f'{P}_base.mp4']
fc = ''
for i, (clip, t0, t1) in enumerate(segs, 1):
    inp += ['-stream_loop', '-1', '-i', f'{A}/{clip}.mov']
    flip = ',hflip' if S.get('adaFlip') else ''
    fc += f'[{i}:v]fps=30,scale=-1:{HH}{flip},trim=0:{t1 - t0:.2f},setpts=PTS-STARTPTS+{t0}/TB[a{i}];'
inp += ['-i', f'{P}_top.mov']
prev = '0:v'
for i, (clip, t0, t1) in enumerate(segs, 1):
    fc += f"[{prev}][a{i}]overlay={X}:{Y}:eof_action=pass:enable='between(t,{t0},{t1})'[v{i}];"
    prev = f'v{i}'
fc += f'[{prev}][{len(segs) + 1}:v]overlay=0:0[v]'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inp, '-filter_complex', fc, '-map', '[v]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-t', str(D), f'{P}_v.mp4'], check=True)

# --- ses
sr = 44100; n = int(D * sr); t = np.arange(n) / sr
rng = np.random.default_rng(7)
mood = S.get('music', 'neutral')
base_f = {'neutral': 55, 'tense': 49, 'retro': 65.4}[mood]
chord = {'neutral': [261.63, 329.63, 392.0], 'tense': [233.08, 277.18, 349.23], 'retro': [261.63, 311.13, 392.0]}[mood]
mus = 0.22 * np.sin(2 * np.pi * base_f * t) * np.exp(-14 * np.mod(t, 0.5))
for f in chord: mus += 0.025 * np.sin(2 * np.pi * f * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * t))
mus += 0.03 * rng.standard_normal(n) * np.exp(-40 * np.mod(t + 0.25, 0.5))
if mood == 'retro':  # 8-bit arpej
    sq = np.sign(np.sin(2 * np.pi * np.array(chord)[(np.floor(t * 8) % 3).astype(int)] * 2 * t))
    mus += 0.025 * sq
out = mus * 0.75
def add(sig, at, g=1.0):
    i = int(at * sr); j = min(n, i + len(sig))
    if i < n: out[i:j] += g * sig[:j - i]
def tone(d, f0, f1, dec=25, sq=False):
    tt = np.arange(int(d * sr)) / sr; f = f0 + (f1 - f0) * tt / d; ph = 2 * np.pi * np.cumsum(f) / sr
    w = np.sign(np.sin(ph)) * 0.5 if sq else np.sin(ph)
    return w * np.exp(-dec * tt)
for b in S['bubbles']: add(0.33 * tone(0.09, 900, 500, 30), b[0])
for t0, t1 in S.get('sfx', {}).get('chirps', []):
    c = t0 + 0.1
    while c < t1 - 0.15:
        d = rng.uniform(0.07, 0.16); f0 = rng.uniform(700, 1500)
        tt = np.arange(int(d * sr)) / sr; env = np.sin(np.pi * tt / d)
        add(0.3 * tone(d, f0, f0 * rng.uniform(0.6, 1.7), 0, True) * env, c); c += d + rng.uniform(0.02, 0.08)
for at in S.get('sfx', {}).get('ticks', []): add(0.3 * tone(0.12, 650, 650, 25), at)
for at in S.get('sfx', {}).get('ding', []): add(0.35 * tone(0.6, 1318, 1318, 6) + 0.25 * tone(0.6, 1760, 1760, 6), at)
for at in S.get('sfx', {}).get('buzz', []): add(0.3 * tone(0.5, 140, 120, 3, True), at)
for at in S.get('sfx', {}).get('whoosh', []):
    tt = np.arange(int(0.8 * sr)) / sr; nz = rng.standard_normal(len(tt)) * np.sin(np.pi * tt / 0.8)
    add(0.25 * np.convolve(nz, np.ones(30) / 30, 'same') * 4 + 0.15 * tone(0.8, 200, 1200, 1), at)
for t0, t1 in S.get('sfx', {}).get('alarm', []):
    c = t0
    while c < t1: add(0.18 * tone(0.25, 880, 660, 2, True), c); c += 0.5
for t0, t1 in S.get('sfx', {}).get('laugh', []):
    c = t0
    while c < t1: add(0.25 * tone(0.12, 220, 160, 8, True), c); c += 0.17
fd = np.ones(n); fd[:sr] = np.linspace(0, 1, sr); fd[-2 * sr:] = np.linspace(1, 0, 2 * sr); out *= fd
out = out / np.max(np.abs(out)) * 0.8
w = wave.open(f'{P}_sfx.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{P}_v.mp4', '-i', f'{P}_sfx.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-t', str(D), f'{P}.mp4'], check=True)
print('ok', f'{P}.mp4')
