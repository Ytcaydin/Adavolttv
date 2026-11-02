import json
R=0.05; LR=0.04; SAVE=0.15
TR_NEW, TR = 40140, 58640        # BLS OEWS May 2025: kamyon şoförü 10. yüzdelik / medyan
SW_JR, SW = 82460, 135980        # BLS OEWS May 2025: yazılımcı 10. yüzdelik / medyan
DEBT=36710                       # ort. lisans borcu (educationdata.org, Ağu 2026)
rows=[]; tr=0; sw=0; debt=0
for age in range(18,66):
    tr = tr*(1+R) + SAVE*(TR_NEW if age<21 else TR)
    inc = 0 if age<22 else (SW_JR if age<25 else SW)
    if age==22: debt=DEBT
    if debt>0: debt*=1+LR
    b=SAVE*inc
    if age>=22 and debt>0:
        pay=min(debt,b); debt-=pay; b-=pay
    sw = sw*(1+R) + b
    rows.append([age, round(sw-debt), round(tr), round(debt)])
json.dump([[a,s,t] for a,s,t,_ in rows],open('data.json','w'))
print(rows[-1],'cross',next(a for a,s,t,_ in rows if a>22 and s>t),'debtfree',next(a for a,_,_,d in rows if a>22 and d==0))
print([r for r in rows if r[0] in (21,22,23,25,26,27,28,30,35,40)])
print('tr100k',next(a for a,_,t,_ in rows if t>=100000),'sw1m',next(a for a,s,_,_ in rows if s>=1e6),'tr65',rows[-1][2])
