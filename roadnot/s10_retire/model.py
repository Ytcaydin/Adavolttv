import json
R=0.05; INC=87460; SAVE=0.15; SPEND=80000; SS62=1424*12; SS67=2016*12
def run(ret, ss_age, ss):
    p=0; out=[]
    for age in range(25,96):
        if age<ret: p=p*(1+R)+INC*SAVE
        else:
            need=SPEND-(ss if age>=ss_age else 0)
            p=max(0,p*(1+R)-need)
        out.append(round(p))
    return out
a=run(67,67,SS67); b=run(55,62,SS62)
rows=[[25+i,a[i],b[i]] for i in range(len(a))]
json.dump(rows,open('data.json','w'))
print('at55',rows[30],'at67',rows[42],'end',rows[-1])
print('B broke',next((r[0] for r in rows if r[0]>55 and r[2]==0),None),'A broke',next((r[0] for r in rows if r[0]>67 and r[1]==0),None))
print([r for r in rows if r[0] in (35,45,54,55,60,62,67,70,80,90)])
