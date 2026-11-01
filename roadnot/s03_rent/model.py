import json
P=343800; RENT=1531; RATE=0.0724          # Census HVS Q2 2026 (median asking price/rent), Freddie Mac PMMS 29.10.2026
INF=0.03; R=0.05; APP=0.01                # enflasyon, reel getiri, reel konut değer artışı
DOWN=0.20; CLOSE=0.03; SELL=0.06; OWNC=0.025  # vergi+sigorta+bakım: değerin %2,5'i/yıl
L=P*(1-DOWN); r=RATE/12; n=360
M=L*r/(1-(1+r)**-n)
bal=L; home=P; port=P*(DOWN+CLOSE)        # kiracı peşinat+masrafı yatırır
own_port=0.0
rows=[[30, round(home*(1-SELL)-bal-P*CLOSE*0), round(port)]]
rm=(1+R)**(1/12)-1; hm=(1+APP)**(1/12)-1
for m in range(1,n+1):
    defl=(1+INF)**(m/12)
    interest=bal*r; bal-= (M-interest)                      # nominal bakiye
    home*= (1+hm)                                           # reel değer
    own_cost = M/defl + home*OWNC/12                        # reel aylık sahip maliyeti
    rent = RENT                                             # reel kira sabit (enflasyonla artar)
    diff = own_cost - rent
    port = port*(1+rm) + diff                               # kiracı farkı yatırır (negatifse çeker)
    own_port = own_port*(1+rm) + max(0,-diff)               # ev sahibi ucuz kalırsa farkı yatırır
    if diff<0: port -= diff                                 # (kiracı fark ödemez; simetri)
    if m%12==0:
        real_bal=bal/defl
        rows.append([30+m//12, round(home*(1-SELL)-real_bal+own_port), round(port)])
json.dump(rows,open('data.json','w'))
print('M',round(M),'own cost y1',round(M+P*OWNC/12),'rent',RENT)
cr=[a for a,o,rr in rows if o>rr]
print('first owner lead', cr[:1], rows[-1])
for rrow in rows:
    if rrow[0] in (30,31,35,40,45,50,55,60): print(rrow)
