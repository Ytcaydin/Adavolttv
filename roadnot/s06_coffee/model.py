import json
CUP=3.65; Y=CUP*365; R=0.05            # Toast: median drip coffee, Feb 2026
rows=[]; inv=0; sp=0
for age in range(26,66):
    inv=inv*(1+R)+Y; sp+=Y
    rows.append([age, round(inv), -round(sp)])
json.dump(rows,open('data.json','w'))
f=lambda th: next(a for a,i,_ in rows if i>=th)
print(rows[-1],'cups',40*365,'10k',f(10000),'50k',f(50000),'100k',f(100000), [r for r in rows if r[0] in (30,35,45,55)])
