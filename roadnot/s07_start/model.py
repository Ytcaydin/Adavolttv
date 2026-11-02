import json
Y=3600; R=0.05   # $300/month
rows=[]; a=0; b=0; da=0; db=0
for age in range(25,66):
    a=a*(1+R)+Y; da+=Y
    if age>=35: b=b*(1+R)+Y; db+=Y
    rows.append([age, round(a), round(b)])
json.dump(rows,open('data.json','w'))
print(rows[-1], da, db, [r for r in rows if r[0] in (35,40,45,50,55,60)])
f=lambda i,th: next(r[0] for r in rows if r[i]>=th)
print('A100k',f(1,100000),'A500k',f(1,500000),'B100k',f(2,100000),'A at35 total',rows[10])
