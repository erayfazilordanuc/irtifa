# icon-forge

İrtifa'nın logo ve ikon dosyalarını üreten küçük araç takımı. Bağımlılığı yok —
saf Python 3 (yalnızca `zlib` + `math`). Makinede Pillow/ImageMagick olmadığı
için yazıldı.

| Dosya | İş |
| --- | --- |
| `png.py` | PNG oku/yaz (8-bit, interlace yok). Alfa korunur. |
| `draw.py` | Anti-aliased poligon rasterleyici + şekil üreticileri (`rrect`, `circle`, `thick_line`, `chevron`, `arrow_head`) |
| `marks.py` | Terakki dönemi logo adaylarının geometrisi (arşiv) |
| `sheet.py` | Adayları dört bağlamda gösteren tek kontak sayfası |
| `each.py` | Her adayı ayrı dosya olarak dışa aktarır |
| `build_from_brand.py` | **Güncel** uygulama ikonlarını `assets/brand/ikon/` SVG'lerinden üretir |
| `build_app_assets.py` | Terakki'nin eski Kademe türetmesi; güncel ikonları ezmesin diye `--eski-kademe` olmadan çalışmaz |

## Kullanım

```bash
cd tools/icon-forge
python3 sheet.py . /tmp/adaylar.png          # toplu karşılaştırma
python3 each.py  . ~/Desktop/logo-adaylari   # tek tek
```

## Dikkat

`draw.py` içindeki dolgu **nonzero winding** kullanıyor ve poligonların sarım
yönünü doldurmadan önce tekdüze hâle getiriyor. Bu satır kaldırılırsa çakışan
iki şeklin ortak alanı delik olarak çıkar — ok gövdesi ok başının içinde delik
açıyordu, hata buradan geliyordu.

## Uygulama ikonları

```bash
python3 tools/icon-forge/build_from_brand.py
```

Degradeyi `irtifa-icon-master.svg`'nin `stop-color`'larından, figürü
`irtifa-icon-mark.svg`'nin poligonlarından okur; renk ya da boyut koda gömülü
değil (boyut: `MARK_SCALE`). İşaretin iki yolu var: `data-role="main"` (gövde,
beyaz) ve `data-role="accent"` (ok ucu, kendi `fill` rengiyle). Vurgu rengi
yalnızca degrade zeminli tam ikonda görünür; maske olarak kullanılan katmanlar
(Android ön plan/monokrom, splash) tek renk kalır. Ayrıntı
`assets/brand/README.md`'de.

Çıktılar:
- `icon.png` (1024×1024) — marka degradesi + beyaz figür
- `brand/app-icon.png` (1024×1024) — icon.png'ye aynı
- `android-icon-background.png` (1024×1024) — desen degrade zemin
- `android-icon-foreground.png` (1024×1024) — beyaz figür, şeffaf zemin
- `android-icon-monochrome.png` (1024×1024) — beyaz figür, şeffaf zemin
- `splash-icon.png` (1024×1024) — tam boy figür (ölçek: SPLASH_SCALE)
- `favicon.png` (48×48) — icon.png'den alan ortalamasıyla küçültülen (web için)

> **Degrade:** `#1E2B45` → `#0F172A` → `#0A101F`, kaynak
> `irtifa-icon-master.svg`. Terakki'nin yeşil degradesi ve ikonları
> `assets/brand/arsiv/terakki/` altında duruyor.
> `app.json` → `adaptiveIcon.backgroundColor` / splash `backgroundColor`,
> `SplashOverlay.tsx` ve iOS `SplashScreenBackground.colorset` orta durakla
> (`#0F172A`) aynı kalmalı. Renklerin kod tarafındaki kaynağı
> `src/components/themeTokens.ts` → `BRAND`.
