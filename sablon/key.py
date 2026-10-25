import sys, subprocess, numpy as np
from PIL import Image

def matte(fg):
    f = fg.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    d = g - np.maximum(r, b)
    a = 1.0 - np.clip((d - 38.0) / 32.0, 0, 1)
    spill = np.clip(d, 0, None) * (d > 0) * 1.0
    g2 = np.where((d > 0) & (a < 1.0) | (d > 25), np.maximum(r, b) + np.clip(d, 0, 25) * 0.3, g)
    f[..., 1] = np.where(a > 0, g2, g)
    return f, a[..., None]

def comp(fg, bg):
    f, a = matte(fg)
    return (f * a + bg.astype(np.float32) * (1 - a)).clip(0, 255).astype(np.uint8)

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'frame':
        fg = np.array(Image.open(sys.argv[2]).convert('RGB'))
        bg = np.array(Image.open(sys.argv[3]).convert('RGB').resize((fg.shape[1], fg.shape[0])))
        Image.fromarray(comp(fg, bg)).save(sys.argv[4])
    elif mode == 'video':
        src, bgp, out = sys.argv[2:5]
        W, H = 768, 1344
        bg = np.array(Image.open(bgp).convert('RGB').resize((W, H)))
        dec = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
        enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-',
                                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
        n = W * H * 3
        while True:
            buf = dec.stdout.read(n)
            if len(buf) < n: break
            fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
            enc.stdin.write(comp(fr, bg).tobytes())
        enc.stdin.close(); enc.wait()
