import json
# net asgari ücret (yeni TL) — (yıl, başlangıç ayı, tutar); ay 1..12
W = [(2000,1,82.42),(2000,4,80.55),(2000,7,86.92),(2001,1,102.37),(2001,7,107.32),(2001,8,122.19),(2002,1,163.56),(2002,7,184.25),(2003,1,226.00),
(2004,1,303.08),(2004,7,318.23),(2005,1,350.15),(2006,1,380.46),(2007,1,403.03),(2007,7,419.15),(2008,1,481.55),(2008,7,503.26),(2009,1,527.13),(2009,7,546.48),
(2010,1,576.57),(2010,7,599.12),(2011,1,629.96),(2011,7,658.95),(2012,1,701.13),(2012,7,739.79),(2013,1,773.01),(2013,7,803.68),(2014,1,846.00),(2014,7,891.03),
(2015,1,949.07),(2015,7,1000.54),(2016,1,1300.99),(2017,1,1404.06),(2018,1,1603.12),(2019,1,2020.90),(2020,1,2324.71),(2021,1,2825.90),(2022,1,4253.40),(2022,7,5500.35),
(2023,1,8506.80),(2023,7,11402.32),(2024,1,17002.12),(2025,1,22104.67),(2026,1,28075.50)]
G = {2000:5.55,2001:10.37,2002:15.00,2003:17.84,2004:18.81,2005:19.26,2006:27.64,2007:29.02,2008:36.34,2009:48.65,2010:59.27,2011:85.05,2012:96.58,2013:86.15,
2014:89.00,2015:100.98,2016:120.96,2017:147.67,2018:195.06,2019:253.60,2020:400.58,2021:515.39,2022:952.63,2023:1485.05,2024:2525.66,2025:4413.95,2026:6687.22}
GRAM_BUGUN, ASG = 6402.16, 28075.50
def wage(y,m):
    w=None
    for (yy,mm,v) in W:
        if (yy,mm)<=(y,m): w=v
    return w
months=[(y,m) for y in range(2000,2027) for m in range(1,13) if (y,m)<=(2026,10)]
grams=0; paid=0; by_year={}
for y,m in months:
    p=wage(y,m)*0.10; g=p/G[y]; grams+=g; paid+=p
    by_year[y]=dict(gram=round(grams,1), odenen=round(paid), deger=round(grams*G[y]))
val=grams*GRAM_BUGUN
res=dict(ay_sayisi=len(months), toplam_gram=round(grams,1), toplam_odenen=round(paid), bugun_deger=round(val), kat=round(val/paid,1),
  kac_asgari=round(val/ASG,1), ilk_ay_ayrilan=round(82.42*0.1,2), ilk_ay_eski=round(82.42*0.1*1e6), bugun_ayrilan=round(ASG*0.1,2),
  gram_ceyrek_esdeger=round(grams/1.75), yil=by_year)
# sadece 2000 yılında ayırsaydın
g2000=sum(wage(2000,m)*0.1/G[2000] for m in range(1,13))
res['sadece_2000_gram']=round(g2000,1); res['sadece_2000_deger']=round(g2000*GRAM_BUGUN)
# 2001 krizinde bıraksaydın (2000-Şubat 2001)
json.dump(res,open('hesap10.json','w'),ensure_ascii=False,indent=1)
print({k:v for k,v in res.items() if k!='yil'})
for y in [2001,2005,2008,2013,2018,2021,2023,2024,2025,2026]: print(y,by_year[y])
