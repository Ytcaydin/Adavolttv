import json
PACK=10.0; YEAR=PACK*365; R=0.05
rows=[]; inv=0; spent=0
for age in range(20,66):
    inv=inv*(1+R)+YEAR; spent+=YEAR
    rows.append([age, round(inv), -round(spent)])
json.dump(rows,open('data.json','w'))
f=lambda th: next(a for a,i,_ in rows if i>=th)
print(rows[-1], '100k',f(100000),'250k',f(250000),'500k',f(500000), 'growth>dep', next(a for a,i,_ in rows if i*R>YEAR))
print([r for r in rows if r[0] in (30,40,50,65)])
