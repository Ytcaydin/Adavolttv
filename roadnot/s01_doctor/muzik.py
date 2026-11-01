import numpy as np, wave
sr=44100; D=30.0; n=int(D*sr); t=np.arange(n)/sr; out=np.zeros(n)
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
for b in np.arange(0.0, 19.0, beat):
    tt=np.arange(int(0.25*sr))/sr; add(0.5*np.sin(2*np.pi*(55+60*np.exp(-30*tt))*tt)*np.exp(-12*tt), b)
    add(0.05*np.random.default_rng(int(b*100)).standard_normal(int(0.04*sr))*np.exp(-np.arange(int(0.04*sr))/sr*80), b+beat/2)
# sayaç tıkları 2.4–4.0 ve yıl tıkları
for at in [0.000,0.593,1.187,1.780,2.373,2.967,3.560,4.153,4.747,5.340,5.933,6.527,7.120,7.713,8.307,8.900,9.493,10.087,10.680,10.926,11.171,11.417,11.662,11.908,12.153,12.399,12.644,12.890,13.135,13.381,13.626,13.872,14.117,14.363,14.608,14.854,15.099,15.345,15.590,15.836,16.081,16.327,16.572,16.818,17.063,17.309,17.554,17.800]: add(0.07*tone(0.06,1200,50), at)
# vurgu: 135$ (4.0), son değer (21.5), karşılaştırma (24.0, 24.9)
for at,f in [(0.0,659.3),(2.373,587.3),(5.340,659.3),(6.527,987.8),(10.680,880),(19.5,1046.5),(20.1,784),(21.2,659.3),(24.6,880)]: add(0.25*tone(0.9,f,4)+0.12*tone(0.9,f*2,6),at)
# yükselen ses 20–21.5
tt=np.arange(int(1.5*sr))/sr; add(0.06*np.random.default_rng(1).standard_normal(len(tt))*(tt/1.5)**2,10.899)
tt=np.arange(int(1.2*sr))/sr; add(0.9*np.sin(2*np.pi*(45+25*np.exp(-6*tt))*tt)*np.exp(-3*tt)+0.12*np.sin(2*np.pi*233.1*tt)*np.exp(-2.5*tt)+0.1*np.sin(2*np.pi*277.2*tt)*np.exp(-2.5*tt),4.747)
for k,f in enumerate([523.3,659.3,784,1046.5]): add(0.22*tone(0.5,f,5),12.399+k*0.08)
fd=np.ones(n); fd[:int(0.02*sr)]=np.linspace(0,1,int(0.02*sr)); fd[-int(0.4*sr):]=np.linspace(1,0,int(0.4*sr)); out*=fd
out=out/np.max(np.abs(out))*0.85
w=wave.open('muzik.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close(); print('ok')
