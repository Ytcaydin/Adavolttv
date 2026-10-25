import sys, subprocess, numpy as np
from PIL import Image
sys.path.insert(0, '.')
from key import matte
W, H, SC, OX = 1080, 1920, 1.1, -122
src, bgp, out = sys.argv[1:4]
bg = Image.open(bgp).convert('RGB').resize((W, H), Image.LANCZOS)
fw, fh = 768, 1344
nw, nh = int(fw * SC), int(fh * SC)
OY = H - nh
dec = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
n = fw * fh * 3
while True:
    buf = dec.stdout.read(n)
    if len(buf) < n: break
    fr = np.frombuffer(buf, np.uint8).reshape(fh, fw, 3)
    f, a = matte(fr)
    rgba = Image.fromarray(np.dstack([f.clip(0, 255), a[..., 0] * 255]).astype(np.uint8), 'RGBA').resize((nw, nh), Image.BILINEAR)
    canvas = bg.copy(); canvas.paste(rgba, (OX, OY), rgba)
    enc.stdin.write(canvas.tobytes())
enc.stdin.close(); enc.wait()
