import re, json, subprocess, math, wave
import numpy as np
txt=open('seslendirme.txt').read()
secs=re.split(r'\[(.*?)\]\n',txt)[1:]
S=[]
for i in range(0,len(secs),2):
    for s in re.split(r'(?<=[.?!:])\s+(?=[A-ZÇĞİÖŞÜ"])',secs[i+1].replace('\n',' ').strip()):
        if s.strip(): S.append((secs[i],s.strip()))
V=lambda s:len(re.findall(r'[aeıioöuüAEIİOÖUÜâ]',s))
syl=[V(s) for _,s in S]; N=len(S)
w=wave.open('ses.wav'); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768; w.close()
D=len(x)/sr
# 10 ms enerji (dB)
hop=int(sr*0.01); fr=len(x)//hop
e=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2))+1e-6 for i in range(fr)]); db=20*np.log10(e)
sm=np.convolve(db,np.ones(5)/5,'same')
voiced=sm>-38
# hece çekirdekleri: yerel tepeler, 2 dB baskınlık, en az 70 ms ara
peaks=[]
for i in range(2,fr-2):
    if voiced[i] and sm[i]>=sm[i-1] and sm[i]>sm[i+1] and sm[i]>=sm[i-2] and sm[i]>=sm[i+2]:
        lo=min(sm[max(0,i-8):i].min(), sm[i+1:i+9].min())
        if sm[i]-lo>=2.0 and (not peaks or i-peaks[-1]>=7): peaks.append(i)
pt=np.array(peaks)*0.01
C=lambda t: np.searchsorted(pt,t)
# duraklamalar (adaylar): sessiz bölgeler >= 0.1 s
sil=[];i=0
while i<fr:
    if not voiced[i]:
        j=i
        while j<fr and not voiced[j]: j+=1
        if (j-i)*0.01>=0.1 and i>0 and j<fr: sil.append((i*0.01,j*0.01))
        i=j
    else: i+=1
first=next(k for k in range(fr) if voiced[k])*0.01; last=(fr-1-next(k for k in range(fr) if voiced[fr-1-k]))*0.01
kk=len(pt)/sum(syl); print('tepe',len(pt),'hece',sum(syl),'oran',round(kk,3),'aday',len(sil))
M=len(sil); INF=1e18
def cost(i,ta,tb,pl):
    exp=syl[i]*kk; got=C(tb)-C(ta)
    return (got-exp)**2/max(exp,2) - 1.2*math.log(pl+0.05)
mid=[(a+z)/2 for a,z in sil]; plen=[z-a for a,z in sil]
dp=np.full((N,M),INF); bk=np.full((N,M),-1,int)
for j in range(M): dp[0][j]=cost(0,first,mid[j],plen[j])
for i in range(1,N-1):
    for j in range(M):
        best=INF;bj=-1
        for k in range(max(0,j-60),j):
            if dp[i-1][k]>=INF: continue
            c=dp[i-1][k]+cost(i,mid[k],mid[j],plen[j])
            if c<best: best,bj=c,k
        dp[i][j]=best;bk[i][j]=bj
best=INF;bj=-1
for k in range(M):
    c=dp[N-2][k]+cost(N-1,mid[k],last,0.5)
    if c<best: best,bj=c,k
ends=[bj]
for i in range(N-2,0,-1): ends.append(bk[i][ends[-1]])
ends=ends[::-1]
res=[]
for i,(sec,s) in enumerate(S):
    t0=first if i==0 else sil[ends[i-1]][1]           # konuşma başlangıcı
    t1=last if i==N-1 else sil[ends[i]][0]            # konuşma bitişi
    res.append(dict(sec=sec,t0=round(t0,2),t1=round(t1,2),text=s))
# cümle içi duraklamalar (alt yazı bölmeleri için)
for r in res: r['pauses']=[(round(a,2),round(z,2)) for a,z in sil if r['t0']<a and z<r['t1']]
json.dump(res,open('cumleler2.json','w'),ensure_ascii=False,indent=0)
old=json.load(open('cumleler.json'))
for a,b in zip(old,res):
    d=b['t0']-a['t0']
    flag='  <<<' if abs(d)>0.8 else ''
    print(f"{a['t0']:7.2f} -> {b['t0']:7.2f} ({d:+.2f}) {b['text'][:45]}{flag}")
