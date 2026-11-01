import numpy as np, wave, json, sys
C=json.loads(open(sys.argv[1]).read()); outp=sys.argv[2]
sr=44100; D=C['dur']; n=int(D*sr); out=np.zeros(n); beat=0.6
def add(sig,at,g=1.0):
    i=int(at*sr); j=min(n,i+len(sig))
    if 0<=i<n: out[i:j]+=g*sig[:j-i]
def tone(d,f,dec=6):
    tt=np.arange(int(d*sr))/sr; return np.sin(2*np.pi*f*tt)*np.exp(-dec*tt)
ch=[[220,261.6,329.6],[174.6,220,261.6],[196,261.6,329.6],[196,246.9,293.7]]
for k in range(int(D/(beat*4))+1):
    tt=np.arange(int(beat*4*sr))/sr; env=np.minimum(1,tt/0.3)*np.exp(-0.25*tt)
    for f in ch[k%4]: add(0.05*np.sin(2*np.pi*f*tt)*env, k*beat*4)
for b in np.arange(0.0, C['raceEnd']+1.2, beat):
    tt=np.arange(int(0.25*sr))/sr; add(0.5*np.sin(2*np.pi*(55+60*np.exp(-30*tt))*tt)*np.exp(-12*tt), b)
    add(0.05*np.random.default_rng(int(b*100)).standard_normal(int(0.04*sr))*np.exp(-np.arange(int(0.04*sr))/sr*80), b+beat/2)
for at in C['ticks']: add(0.07*tone(0.06,1200,50),at)
notes=[659.3,784,880,987.8,1046.5,880,784,659.3]
for i,at in enumerate(C['events']): add(0.16*tone(0.5,notes[i%len(notes)],6),at)
for at in C['low']:
    tt=np.arange(int(1.2*sr))/sr; add(0.9*np.sin(2*np.pi*(45+25*np.exp(-6*tt))*tt)*np.exp(-3*tt)+0.12*np.sin(2*np.pi*233.1*tt)*np.exp(-2.5*tt),at)
for at in C['rise']:
    tt=np.arange(int(1.5*sr))/sr; add(0.06*np.random.default_rng(1).standard_normal(len(tt))*(tt/1.5)**2,at-1.5)
    for k,f in enumerate([523.3,659.3,784,1046.5]): add(0.22*tone(0.5,f,5),at+k*0.08)
for at,f in [(C['res']+0.3,1046.5),(C['res']+0.9,784),(C['res']+2.0,659.3),(C['q'],880)]: add(0.25*tone(0.9,f,4)+0.12*tone(0.9,f*2,6),at)
fd=np.ones(n); fd[:int(0.02*sr)]=np.linspace(0,1,int(0.02*sr)); fd[-int(0.4*sr):]=np.linspace(1,0,int(0.4*sr)); out*=fd
out=out/np.max(np.abs(out))*0.85
w=wave.open(outp,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close(); print('music ok')
