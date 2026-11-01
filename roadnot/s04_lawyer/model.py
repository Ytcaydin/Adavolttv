import json
R=0.05; LR=0.04; SAVE=0.15
EL_APP, EL = 42640, 63190        # BLS OEWS May 2025: 10. yüzdelik (çırak), medyan
LW_JR, LW = 78360, 159670        # BLS OEWS May 2025: 10. yüzdelik (ilk yıllar), medyan
DEBT=130000                      # ort. hukuk mezunu borcu (Bankrate)
rows=[]; el=0; lw=0; debt=0
for age in range(18,66):
    el = el*(1+R) + SAVE*(EL_APP if age<22 else EL)
    inc = 0 if age<25 else (LW_JR if age<28 else LW)
    if age==25: debt=DEBT
    if debt>0: debt*=1+LR
    b=SAVE*inc
    if age>=25 and debt>0:
        pay=min(debt,b); debt-=pay; b-=pay
    lw = lw*(1+R) + b
    rows.append([age, round(lw-debt), round(el), round(debt)])
json.dump([[a,l,e] for a,l,e,_ in rows],open('data.json','w'))
cross=next(a for a,l,e,_ in rows if a>25 and l>e)
print(rows[-1], 'cross', cross, 'debtfree', next(a for a,_,_,d in rows if a>25 and d==0), 'el100k', next(a for a,_,e,_ in rows if e>=100000))
print([r for r in rows if r[0] in (24,25,26,28,30,35,40,45)])
