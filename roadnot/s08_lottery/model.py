import json
R=0.05; INC=87460; SAVE=0.15       # Census 2025 median household income; saver invests 15%/yr
PRIZE=1_000_000; TAX=0.37; NET=PRIZE*(1-TAX); SPEND=50000   # winner at 30, 37% fed tax, spends $50K/yr from the pot
rows=[]; sv=0; w=NET
for age in range(30,61):
    if age>30:
        sv=sv*(1+R)+INC*SAVE
        w=max(0,w*(1+R)-SPEND)
    else:
        sv=INC*SAVE
    rows.append([age, round(sv), round(w)])
json.dump(rows,open('data.json','w'))
print(rows[-1], 'net',NET)
print('broke', next((a for a,_,x in rows if x==0),None),'cross',next((a for a,s,x in rows if s>x),None))
print([r for r in rows if r[0] in (30,31,35,40,45,50,55)])
print('sv100k',next(a for a,s,_ in rows if s>=100000),'sv500k',next(a for a,s,_ in rows if s>=500000))
