# Ada Volt ile Teknoloji

2045'ten 2026'ya bağlanan arşivci **Ada Volt**'un günlük teknoloji haberleri Shorts kanalı (YouTube + Instagram).

- YouTube: @adavoltteknoloji
- Yayın: her gün 19:00
- Kural: **Haberler gerçektir, "2045 notları" kurgudur.**

## Klasörler

| Klasör | İçerik |
|---|---|
| `klipler/yesil/` | Ada'nın yeşil perde klipleri (giris, konusma, hologram, sasirma, onay, veda) — her bölümde yeniden kullanılır |
| `arkaplan/` | 2045 stüdyo arka planları (`sablon/studio.js` ile üretilir) |
| `sablon/` | Video üretim betikleri |
| `kanal/` | Profil fotoğrafı ve kanal kapağı |
| `bolumler/NNN/` | Her bölümün metadatası, seslendirmesi ve final videosu |

## Bölüm formatı

1. **Bağlantı** – "BAĞLANTI KURULDU · 2045 → 2026 · ARŞİV KAYDI AÇILIYOR"
2. **Arşiv Dosyası #NNN** × 5 – gerçek haber (cyan panel) + **2045 NOTU** (mor, ayrı kutu)
3. **Arşiv Sorgusu** – izleyiciye soru
4. **Kayıt kapanıyor** – "Bağlantı yarın 19:00'da yeniden açılacak"

Dosya numaraları kümülatiftir: Bölüm 001 = #001–#005, Bölüm 002 = #006–#010…

## Üretim akışı (v1)

1. Haberler seçilir, seslendirme metni yazılır.
2. Seslendirme kaydedilir (bölümler arası ~1 sn boşluk).
3. `compress.py` uzun sessizlikleri kısaltır, `subs.py` alt yazıları sesteki duraklamalara oturtur.
4. `key2.py` yeşil perde kliplerini stüdyo arka planlarına yerleştirir, `montage3.py` karakter kurgusunu bölüm sürelerine göre kurar.
5. `overlay3.js` panelleri, alt yazıları, 2045 notlarını ve bandı bindirir; ffmpeg ses + müziği mikslenir.

> v1 betikleri tek bir çalışma klasöründen çalışacak şekilde yazıldı; günlük otomasyona geçerken parametrik hale getirilecek.
