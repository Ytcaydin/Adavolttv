import json, wave, numpy as np
R=json.load(open('cumleler2.json'))
def load(f):
    w=wave.open(f);sr=w.getframerate();d=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32);w.close();return d,sr
A,sr=load('ses.wav'); B,_=load('abone.wav')
def arms(x):
    f=x[:len(x)//240*240].reshape(-1,240); r=np.sqrt((f**2).mean(1)); return np.sqrt((r[r>r.max()*0.1]**2).mean())
B=B*arms(A)/arms(B)
N=len(R); D=len(A)/sr
cut=[0.0]+[ (R[i-1]['t1']+R[i]['t0'])/2 for i in range(1,N)]+[D]
order=list(range(0,94))+[112]+list(range(94,112))+list(range(113,117))+['AB']+[117,118]
pieces=[];t=0.0;new={}
for it in order:
    if it=='AB':
        a,z=0.0,4.0; seg=B[int(0.0*sr):int(4.0*sr)]
        seg=np.concatenate([np.zeros(int(0.25*sr),np.float32),seg[int(0.06*sr):],np.zeros(int(0.2*sr),np.float32)])
        off=t+0.25-0.06
        new['AB']=[dict(sec='KAPANIŞ',t0=round(off+0.16,2),t1=round(off+0.86,2),text='Kanal yeni.',pauses=[]),
                   dict(sec='KAPANIŞ',t0=round(off+1.37,2),t1=round(off+3.75,2),text='Abone olursan bir sonraki hesabı kaçırmazsın.',pauses=[])]
        pieces.append(seg); t+=len(seg)/sr; continue
    a,z=cut[it],cut[it+1]; seg=A[int(a*sr):int(z*sr)]
    if it==112:  # taşınan cümle: önüne biraz nefes payı
        seg=np.concatenate([np.zeros(int(0.35*sr),np.float32),seg]); a-=0.35
    r=dict(R[it]); sh=t-a
    r['t0']=round(r['t0']+sh,2); r['t1']=round(r['t1']+sh,2); r['pauses']=[[round(p+sh,2),round(q+sh,2)] for p,q in r['pauses']]
    if it==112: r['sec']='SONUÇ'
    new[it]=r; pieces.append(seg); t+=len(seg)/sr
out=np.clip(np.concatenate(pieces),-32768,32767).astype(np.int16)
w=wave.open('ses_v2.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(out.tobytes());w.close()
# indeksleri koru (render.js S(i) için): 0..118 aynı indeks, abone 119,120
res=[new[i] for i in range(N)]+new['AB']
json.dump(res,open('cumleler3.json','w'),ensure_ascii=False,indent=0)
print('yeni süre',round(t,2)); 
for i in [93,112,94,111,113,116,117,118]: print(i,res[i]['t0'],res[i]['text'][:40])
print(res[119]['t0'],res[120]['t0'])
