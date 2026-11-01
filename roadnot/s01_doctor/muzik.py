import numpy as np, wave
sr=44100; D=36.0; n=int(D*sr); t=np.arange(n)/sr; out=np.zeros(n)
bpm=100; beat=60/bpm
def add(sig,at,g=1.0):
    i=int(at*sr); j=min(n,i+len(sig))
    if i<n: out[i:j]+=g*sig[:j-i]
def tone(d,f,dec=6):
    tt=np.arange(int(d*sr))/sr; return np.sin(2*np.pi*f*tt)*np.exp(-dec*tt)
# pad akorları (Am - F - C - G)
ch=[[220,261.6,329.6],[174.6,220,261.6],[196,261.6,329.6],[196,246.9,293.7]]
for k in range(int(D/(beat*4))+1):
    c=ch[k%4]; st=k*beat*4
    for f in c:
        tt=np.arange(int(beat*4*sr))/sr; env=np.minimum(1,tt/0.3)*np.exp(-0.25*tt)
        add(0.05*np.sin(2*np.pi*f*tt)*env, st)
# vuruş: 6. sn'den itibaren (grafik), kick + hat
for b in np.arange(6.0, 25.4, beat):
    tt=np.arange(int(0.25*sr))/sr; add(0.5*np.sin(2*np.pi*(55+60*np.exp(-30*tt))*tt)*np.exp(-12*tt), b)
    add(0.05*np.random.default_rng(int(b*100)).standard_normal(int(0.04*sr))*np.exp(-np.arange(int(0.04*sr))/sr*80), b+beat/2)
# sayaç tıkları 2.4–4.0 ve yıl tıkları
for at in [0.3,0.7]: add(0.2*tone(0.4,659.3,8),at)
for at in [6.400,6.987,7.573,8.160,8.747,9.333,9.920,10.507,11.093,11.680,12.267,12.853,13.440,14.027,14.613,15.200,15.787,16.373,16.960,17.203,17.446,17.688,17.931,18.174,18.417,18.659,18.902,19.145,19.388,19.630,19.873,20.116,20.359,20.601,20.844,21.087,21.330,21.572,21.815,22.058,22.301,22.543,22.786,23.029,23.272,23.514,23.757,24.000]: add(0.08*tone(0.06,1200,50), at)
# vurgu: 135$ (4.0), son değer (21.5), karşılaştırma (24.0, 24.9)
for at,f in [(6.400,784),(8.747,659.3),(11.093,392),(12.853,987.8),(15.787,1046.5),(25.9,1046.5),(26.5,784),(27.6,659.3),(31.1,880)]: add(0.25*tone(0.9,f,4)+0.12*tone(0.9,f*2,6),at)
# yükselen ses 20–21.5
tt=np.arange(int(1.5*sr))/sr; add(0.06*np.random.default_rng(1).standard_normal(len(tt))*(tt/1.5)**2,22.5)
fd=np.ones(n); fd[:int(0.3*sr)]=np.linspace(0,1,int(0.3*sr)); fd[-int(1.2*sr):]=np.linspace(1,0,int(1.2*sr)); out*=fd
out=out/np.max(np.abs(out))*0.85
w=wave.open('muzik.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close(); print('ok')
