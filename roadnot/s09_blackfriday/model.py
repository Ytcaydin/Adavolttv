import json
SP={2010:14.82,2011:2.10,2012:15.89,2013:32.15,2014:13.52,2015:1.38,2016:11.77,2017:21.61,2018:-4.23,2019:31.21,2020:18.02,2021:28.47,2022:-18.04,2023:26.06,2024:24.88,2025:17.78}  # Damodaran, S&P 500 incl. dividends
BF=337.86   # NRF 2025 avg spend per Thanksgiving-weekend shopper
inv=0; sp=0; rows=[]
for y in range(2010,2026):
    inv=(inv+BF)*(1+SP[y]/100); sp+=BF
    rows.append([y, round(inv), -round(sp)])
json.dump(rows,open('data.json','w'))
print(rows[-1]); print([r for r in rows if r[0] in (2012,2014,2018,2020,2022)])
for th in (1000,2000,3000,5000): print(th,next(a for a,i,_ in rows if i>=th))
