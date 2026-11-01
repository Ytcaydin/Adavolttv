import json
R=0.05      # yatırım getirisi (enflasyon sonrası)
LR=0.04     # kredi faizi (enflasyon sonrası: ~%7 nominal - %3)
SAVE=0.15
PL_APP, PL=44150, 63800          # BLS OEWS May 2025: 10. yüzdelik (çırak), medyan
RES, MD=68166, 275930            # AAMC 2025 PGY-1 ort., BLS May 2025 medyan
DEBT=223130                      # 2025 mezunu ort. tıp borcu (educationdata.org)
rows=[]; pl=0; md=0; debt=0
for age in range(18,66):
    # tesisatçı
    inc_p = PL_APP if age<22 else PL
    pl = pl*(1+R) + SAVE*inc_p
    # doktor
    if age<26: inc_d=0
    elif age<29: inc_d=RES
    else: inc_d=MD
    if age==26: debt=DEBT
    debt*= (1+LR) if debt>0 else 1
    md = md*(1+R) + SAVE*inc_d
    if age>=29 and debt>0:
        pay=min(debt, 0.15*inc_d); debt-=pay
    rows.append([age, round(pl), round(md-debt), round(debt)])
cross=next(a for a,p,d,_ in rows if a>26 and d>p)
json.dump(rows,open('data.json','w'))
for r in rows:
    if r[0] in (18,22,26,29,30,35,cross-1,cross,40,45,50,55,60,65): print(r)
print('cross',cross, 'debt paid age', next(a for a,_,_,db in rows if a>29 and db==0))
