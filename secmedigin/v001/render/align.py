import re, json, subprocess, math, sys
W_P=float(sys.argv[1]) if len(sys.argv)>1 else 0.8
txt=open('seslendirme.txt').read()
secs=re.split(r'\[(.*?)\]\n',txt)[1:]
S=[]  # (section, sentence)
for i in range(0,len(secs),2):
    name=secs[i]; body=secs[i+1].replace('\n',' ')
    for s in re.split(r'(?<=[.?!:])\s+(?=[A-ZÇĞİÖŞÜ"])',body.strip()):
        if s.strip(): S.append((name,s.strip()))
V=lambda s:len(re.findall(r'[aeıioöuüAEIİOÖUÜâ]',s))
out=subprocess.run(['ffmpeg','-i','ses.wav','-af','silencedetect=noise=-38dB:d=0.1','-f','null','-'],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r'silence_start: ([0-9.]+)',out)]; en=[float(x) for x in re.findall(r'silence_end: ([0-9.]+)',out)]
D=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','ses.wav']))
P=[(a,z) for a,z in zip(st,en) if a>0.05 and z<D-0.05]
speech0=en[0] if st and st[0]<0.05 else 0.0
end_speech=st[-1] if en[-1]>=D-0.05 else D
cand=[(a+z)/2 for a,z in P]; plen=[z-a for a,z in P]
N=len(S); syl=[V(s) for _,s in S]
# konuşma süresi ~ hece; duraklamalar ayrı
tot_speech=(end_speech-speech0)-sum(plen)
rate=sum(syl)/tot_speech
print('cümle',N,'aday',len(cand),'hece/sn',round(rate,2))
# beklenen konuşma süresi; gerçek süre = aralık - içerdiği duraklamalar
import bisect
pre=[0]
for l in plen: pre.append(pre[-1]+l)
def seg_speech(a_idx,b_idx,ta,tb):
    # ta..tb arası, a_idx..b_idx-1 duraklamalarının tamamı içeride (kabaca)
    return (tb-ta)-(pre[b_idx]-pre[a_idx+1] if b_idx>a_idx+1 else 0)
M=len(cand); INF=1e18
# dp[i][j]: i. cümle j. adayda bitiyor (j index into cand), ya da son cümle -> end
dp=[[INF]*M for _ in range(N)]; bk=[[-1]*M for _ in range(N)]
def cost(i,ta,tb,ja,jb,pl):
    exp=syl[i]/rate
    sp=(tb-ta)-sum(plen[k] for k in range(ja+1,jb)) if jb>ja+1 else (tb-ta)
    return (sp-exp)**2/max(exp,0.5) - W_P*math.log(pl+0.05)
for j in range(M):
    dp[0][j]=cost(0,speech0,cand[j],-1,j,plen[j])
for i in range(1,N-1):
    for j in range(M):
        best=INF;bj=-1
        for k in range(max(0,j-60),j):
            if dp[i-1][k]>=INF: continue
            c=dp[i-1][k]+cost(i,cand[k],cand[j],k,j,plen[j])
            if c<best: best,bj=c,k
        dp[i][j]=best; bk[i][j]=bj
best=INF;bj=-1
for k in range(M):
    if dp[N-2][k]>=INF: continue
    c=dp[N-2][k]+cost(N-1,cand[k],end_speech,k,M,0.5)
    if c<best: best,bj=c,k
ends=[bj]
for i in range(N-2,0,-1): ends.append(bk[i][ends[-1]])
ends=ends[::-1]
bounds=[speech0]+[cand[j] for j in ends]+[end_speech]
res=[]
for i,(sec,s) in enumerate(S): res.append(dict(sec=sec,t0=round(bounds[i],2),t1=round(bounds[i+1],2),text=s))
json.dump(res,open('cumleler.json','w'),ensure_ascii=False,indent=0)
secstart={}
for r in res: secstart.setdefault(r['sec'],r['t0'])
print(secstart)
for r in res: 
    exp=V(r['text'])/rate; print(r['t0'],r['t1'],round(r['t1']-r['t0']-exp,1),r['text'][:50])
