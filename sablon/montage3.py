import json, subprocess, os, sys
FPS = 30
SCENE = {'intro':'neon','n1':'lab','n2':'sunucu','n3':'neon','n4':'uzay','n5':'sinema','soru':'sinema','outro':'neon'}
cuts = json.load(open('cuts.json'))  # {"bounds":[0,7.35,...,end], "names":[...]}
names = ['giris', 'konusma', 'hologram', 'sasirma', 'onay', 'veda']
dur = {n: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'green/{n}.mp4']).decode()) - 0.05 for n in names}
pattern = {
    'intro': [('giris', 'push'), ('konusma', 'close')],
    'n1': [('sasirma', 'wide'), ('konusma', 'close'), ('onay', 'push')],
    'n2': [('hologram', 'push'), ('konusma', 'close')],
    'n3': [('konusma', 'wide'), ('onay', 'close'), ('konusma', 'push')],
    'n4': [('hologram', 'close'), ('konusma', 'push')],
    'n5': [('sasirma', 'close'), ('konusma', 'wide'), ('onay', 'push')],
    'soru': [('onay', 'push'), ('konusma', 'close')],
    'outro': [('veda', 'wide'), ('onay', 'wide')],
}
os.makedirs('seg3', exist_ok=True)
files, bounds, frame = [], {}, 0
b = cuts['bounds']
k = 0
for si, sec in enumerate(cuts['names']):
    target = round(b[si + 1] * FPS)
    start_f = frame
    pi, rev = 0, False
    while frame < target:
        clip, zoom = pattern[sec][pi % len(pattern[sec])]
        n = min(round(dur[clip] * FPS), target - frame)
        if n < 8:
            break
        Z = '1' if zoom == 'wide' else '1.18' if zoom == 'close' else f'(1+0.10*t/{n / FPS:.3f})'
        vf = ('reverse,' if rev else '') + f"fps={FPS},scale=w='2*trunc(540*{Z})':h='2*trunc(960*{Z})':eval=frame,crop=1080:1920:(iw-1080)*0.2:(ih-1920)*0.15,setsar=1"
        out = f'seg3/{k:03d}.mp4'
        ss = max(0, dur[clip] - n / FPS) if rev else 0
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{ss:.3f}', '-i', f'k2/{SCENE[sec]}/{clip}.mp4', '-vf', vf, '-frames:v', str(n), '-an',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', str(FPS), out], check=True)
        real = int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', out]).decode())
        frame += real
        files.append(out); k += 1; pi += 1
        if pi % len(pattern[sec]) == 0: rev = not rev
    if frame < target and files:  # pad tiny remainder by freezing last frame
        out = f'seg3/{k:03d}.mp4'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-sseof', '-0.1', '-i', files[-1], '-vf', f'tpad=stop_mode=clone:stop={target - frame}', '-frames:v', str(target - frame),
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', str(FPS), out], check=True)
        frame = target; files.append(out); k += 1
    bounds[sec] = [start_f / FPS, frame / FPS]
with open('seg3/list.txt', 'w') as f:
    f.writelines(f"file '{os.path.basename(x)}'\n" for x in files)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'seg3/list.txt', '-c', 'copy', 'char_track.mp4'], check=True)
json.dump({'total': frame / FPS, 'bounds': bounds}, open('timeline.json', 'w'), indent=1)
print(json.dumps({'total': frame / FPS, 'bounds': bounds}))
