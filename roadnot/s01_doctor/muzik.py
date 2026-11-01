import numpy as np, wave
sr=44100; D=32.0; n=int(D*sr); t=np.arange(n)/sr; out=np.zeros(n)
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
for b in np.arange(2.0, 21.3, beat):
    tt=np.arange(int(0.25*sr))/sr; add(0.5*np.sin(2*np.pi*(55+60*np.exp(-30*tt))*tt)*np.exp(-12*tt), b)
    add(0.05*np.random.default_rng(int(b*100)).standard_normal(int(0.04*sr))*np.exp(-np.arange(int(0.04*sr))/sr*80), b+beat/2)
# sayaç tıkları 2.4–4.0 ve yıl tıkları
add(0.22*tone(0.5,659.3,6)+0.1*tone(0.5,987.8,8),0.0)
for at in [2.300,2.887,3.473,4.060,4.647,5.233,5.820,6.407,6.993,7.580,8.167,8.753,9.340,9.927,10.513,11.100,11.687,12.273,12.860,13.103,13.346,13.588,13.831,14.074,14.317,14.559,14.802,15.045,15.288,15.530,15.773,16.016,16.259,16.501,16.744,16.987,17.230,17.472,17.715,17.958,18.201,18.443,18.686,18.929,19.172,19.414,19.657,19.900]: add(0.08*tone(0.06,1200,50), at)
# vurgu: 135$ (4.0), son değer (21.5), karşılaştırma (24.0, 24.9)
for at,f in [(4.647,659.3),(8.753,987.8),(21.8,1046.5),(22.4,784),(23.5,659.3),(26.9,880)]: add(0.25*tone(0.9,f,4)+0.12*tone(0.9,f*2,6),at)
# yükselen ses 20–21.5
tt=np.arange(int(1.5*sr))/sr; add(0.06*np.random.default_rng(1).standard_normal(len(tt))*(tt/1.5)**2,10.187)
# borç dibi: alçak, kasvetli vuruş
tt=np.arange(int(1.2*sr))/sr; add(0.9*np.sin(2*np.pi*(45+25*np.exp(-6*tt))*tt)*np.exp(-3*tt)+0.12*np.sin(2*np.pi*233.1*tt)*np.exp(-2.5*tt)+0.1*np.sin(2*np.pi*277.2*tt)*np.exp(-2.5*tt),6.993)
# öne geçiş: yükselen arpej
for k,f in enumerate([523.3,659.3,784,1046.5]): add(0.22*tone(0.5,f,5),11.687+k*0.08)
fd=np.ones(n); fd[:int(0.02*sr)]=np.linspace(0,1,int(0.02*sr)); fd[-int(0.4*sr):]=np.linspace(1,0,int(0.4*sr)); out*=fd
out=out/np.max(np.abs(out))*0.85
w=wave.open('muzik.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close(); print('ok')
