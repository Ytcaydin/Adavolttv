import json
ons = [283.30,293.65,276.75,275.05,272.25,288.15,276.75,277.00,273.65,264.50,269.10,272.65]  # LBMA ay sonu USD/ons
usd = [555761,573036,588318,606302,613665,618985,634207,651328,663434,682053,682883,671765]   # ay sonu alış, eski TL
net = [82.4175]*3 + [80.5509]*3 + [86.9229]*6   # net asgari ücret, yeni TL
GRAM_BUGUN = 6402.16; USD_BUGUN = 49.74; ASG_2026 = 28075.50
rows=[]; tg=0; tl=0; td=0
ay = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
for i in range(12):
    kur = usd[i]/1e6; gram = ons[i]*kur/31.1035; para = net[i]/2
    g = para/gram; d = para/kur
    tg+=g; tl+=para; td+=d
    rows.append(dict(ay=ay[i], net=net[i], yatirilan=round(para,2), gram_fiyat=round(gram,3), gram_fiyat_eski=round(gram*1e6), alinan_gram=round(g,3), dolar=round(d,2)))
res = dict(aylik=rows, toplam_yatirilan_TL=round(tl,2), toplam_yatirilan_eski_TL=round(tl*1e6), toplam_gram=round(tg,2),
  bugun_altin_TL=round(tg*GRAM_BUGUN), bugun_dolar_TL=round(td*USD_BUGUN), toplam_dolar=round(td,2),
  bugun_yastik_TL=round(tl,2), asgari_ucret_kac_maas_altin=round(tg*GRAM_BUGUN/ASG_2026,1), asgari_ucret_kac_maas_dolar=round(td*USD_BUGUN/ASG_2026,1),
  kat_altin=round(tg*GRAM_BUGUN/tl), kat_dolar=round(td*USD_BUGUN/tl),
  y2000_toplam_kac_maas=round(tl/86.9229,1), gram_2000_ort=round(sum(r['gram_fiyat'] for r in rows)/12,3),
  gram_artis_kat=round(GRAM_BUGUN/(sum(r['gram_fiyat'] for r in rows)/12)))
json.dump(res, open('hesap.json','w'), ensure_ascii=False, indent=1)
for r in rows: print(r)
print({k:v for k,v in res.items() if k!='aylik'})
