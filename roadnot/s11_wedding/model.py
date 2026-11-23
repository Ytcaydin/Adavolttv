import json
WED=34000; R=0.05   # The Knot 2026 Real Weddings Study: avg wedding $34,000 (2025 weddings)
rows=[[y, round(WED*(1+R)**y), 0] for y in range(0,21)]
json.dump(rows,open('data.json','w')); print(rows[-1], [r for r in rows if r[0] in (5,10,15)])
