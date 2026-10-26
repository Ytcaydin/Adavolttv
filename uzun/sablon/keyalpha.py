import sys, subprocess, numpy as np
sys.path.insert(0,'/home/claude/ada')
from key import matte
src,out=sys.argv[1:3]
fw,fh=768,1344
dec=subprocess.Popen(['ffmpeg','-loglevel','error','-i',src,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',f'{fw}x{fh}','-r','24','-i','-','-c:v','qtrle','-pix_fmt','argb',out],stdin=subprocess.PIPE)
n=fw*fh*3
while True:
    b=dec.stdout.read(n)
    if len(b)<n: break
    fr=np.frombuffer(b,np.uint8).reshape(fh,fw,3)
    f,a=matte(fr)
    enc.stdin.write(np.dstack([f.clip(0,255),a[...,0]*255]).astype(np.uint8).tobytes())
enc.stdin.close();enc.wait()
