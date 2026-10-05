# Marka

İrtifa'nın logo kaynağı. `assets/` kökündeki uygulama ikonları buradan türetilir;
elle düzenlenmez.

## İşaret

**Yükselen İ** — gövdesi dik duran bir "İ" harfi; noktası yukarı bakan bir ok
ucuna dönüşmüş.

| İstenen anlam | Şekilde karşılığı |
| --- | --- |
| Ad | Harfin kendisi okunuyor: İ |
| Yükselme | Nokta yerine yukarı bakan ok ucu |
| Yön | Ok gövdeyle aynı eksende; şekil tek bir yöne işaret ediyor |
| Ciddiyet | Simetrik, süssüz, tek eksenli geometri |

Ok ucu gövdeden **ayrı renkte** (zümrüt): şekil tek parça değil, "gövde +
gidilen yön" olarak okunuyor.

### Neden Terakki'nin işareti devralınmadı

Terakki'nin **Kademe** işareti (yükselen dört modül) o uygulamanın "yedi sütunlu
gelişim" anlatısına aitti ve adının baş harfini taşımıyordu. Arşivde:
`arsiv/terakki/`.

## Renkler

Tek kaynak **`src/components/themeTokens.ts` → `BRAND`**; buradaki değerler
onun kopyası, değişirse birlikte değişmeli.

| Kullanım | Değer | Nerede |
| --- | --- | --- |
| Zemin degradesi (üst) | `#1E2B45` | `BRAND.navyLight` |
| Zemin degradesi (orta) | `#0F172A` | `BRAND.navy` — Android `adaptiveIcon.backgroundColor`, native splash zemini |
| Zemin degradesi (alt) | `#0A101F` | `BRAND.navyDark` |
| Vurgu (ok ucu) | `#10B981` | `BRAND.emerald` — bildirim ikonu rengi |
| Gövde | `#FFFFFF` | — |

Palet **sektörsüz** seçildi: lacivert + zümrüt kurumsal ve ciddi bir ton verir,
askerî ya da sektörel bir çağrışım taşımaz. Yazılım sektörüne hazırlanan
kullanıcı da aynı ekranı kendine ait görmeli (YAPILACAKLAR Bölüm 5).

## Dosyalar

| Dosya | Ne |
| --- | --- |
| `ikon/irtifa-icon-master.svg` | Uygulama ikonunun kaynağı: degrade zemin + işaret. **Degrade renkleri buradan okunur.** |
| `ikon/irtifa-icon-mark.svg` | Şeffaf zeminde yalnız işaret. **Geometri buradan okunur.** İki yol: `data-role="main"` (gövde) ve `data-role="accent"` (ok ucu, kendi `fill` rengiyle). |
| `ikon/irtifa-icon-white.svg` | Tek renk (beyaz) varyant — tek renk gereken yerler için |
| `app-icon.png` | `assets/icon.png`'nin kopyası (işaret %62) |
| `arsiv/terakki/` | Terakki'nin işareti ve rasterları |
| `adaylar/` | Terakki döneminden elenen adaylar |

## Yeniden üretmek

```bash
python3 tools/icon-forge/build_from_brand.py
```

`assets/icon.png`, `android-icon-background.png`, `android-icon-foreground.png`,
`android-icon-monochrome.png`, `splash-icon.png`, `favicon.png` ve
`brand/app-icon.png` üretilir.

- İkon işaret boyutu betikteki `MARK_SCALE` (şu an `0.62`); splash görseli tam
  boy işaret taşır (`SPLASH_SCALE`).
- Vurgu rengi yalnızca degrade zeminli tam ikonda görünür; Android ön plan /
  monokrom katmanları ve splash görseli **tek renk** (beyaz), çünkü bu
  katmanlar maske olarak kullanılıyor.
- Native tarafa işlemek için ardından `npx expo prebuild` — önce `DEVAM.md`
  "Ortam tuzakları"nı oku.

`notification-icon.png` bu betikle üretilmiyor.

## Açılış ekranı (splash)

İki katman:

1. **Native splash** — `app.json` → `expo-splash-screen`: düz `#0F172A` zemin,
   ortada `splash-icon.png` 170 dp genişlikte. Android 12+ native splash degrade
   ve yazı desteklemediği için bu kadar.
2. **`src/components/SplashOverlay.tsx`** — native splash'in birebir aynısıyla
   başlar, onu kapatır; degradeyi (`BRAND.navyLight → navy → navyDark`) ve
   altındaki "İrtifa" yazısını açar, sonra uygulamaya solar.

Yazı **sistem fontuyla canlı metin**. Terakki burada Italianno fontundan
üretilmiş bir görsel kullanıyordu: o fontta 'i'nin noktası ilerleme genişliğinin
dışında kaldığı için Android son harfin noktasını kırpıyordu ("Terakkı"). Sistem
fontunda bu sorun yok ve splash font yüklenmesini beklemiyor.

Zemin rengi ve `imageWidth` iki yerde birden geçiyor (`app.json` ve
`SplashOverlay.tsx`); biri değişirse diğeri de değişmeli.
