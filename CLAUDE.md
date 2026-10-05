# İrtifa — Claude çalışma kılavuzu

React Native (Expo SDK 54, RN 0.81, NativeWind v4) **mülakat ve iş hayatı**
hazırlık uygulaması. Arayüz Türkçe, açık + koyu tema.

Yapay zekâ **isteğe bağlı** ve **BYOK**: kullanıcı kendi Gemini anahtarını
girer, çağrılar doğrudan Google'a gider. `server/server.ts` yalnızca isteğe
bağlı bir proxy. Uygulama sunucusuz ve anahtarsız **%100 çalışmalı**.

## Önce oku

| Belge | Ne zaman |
| --- | --- |
| `YAPILACAKLAR.md` | Her iş öncesi — yol haritası, "Sıra" başlığı |
| `KARARLAR.md` | Verilmiş kararlar ve gerekçeleri; buradaki kararı yeniden tartışma |
| `DEVAM.md` → "Ortam tuzakları" | Build / prebuild / `npm install` öncesi **zorunlu** |
| `assets/brand/README.md` | Logo, ikon, marka renkleri |

## Kapsam — neyin içeride olduğu

İrtifa Terakki'den dönüştürüldü; **ne eklendiğinden çok ne çıkarıldığı** önemli:

- **İçeride:** mülakat simülasyonu, kriz senaryoları, maaş görüşmesi, günün alan
  testi, sektör kataloğu, başvuru takibi, STAR, şirket notları, mülakata hizmet
  eden nefes/diksiyon/zihin egzersizleri, ölçüm ve karne.
- **Dışarıda (geri eklenmez):** lugat, belagat, günün edebi metni, dinî içerik
  (Risale vecizeleri, günün duası), genel yaşam hatırlatıcıları (su içme, göz
  molası). Dil & ifade tarafı kardeş uygulama Fesahat'ın kapsamı.

**Sektör koda gömülmez.** Kurum, departman, soru havuzu, haber kaynağı ve yapay
zekâ rolü `src/data/sectors.ts` kataloğundan gelir. Savunma sanayii kataloğun
ilk girdisidir, varsayılanı değil; uygulamanın adı ve teması hiçbir sektöre
bağlanmaz. Arayüzde askerî metafor kullanılmaz.

## Triyaj — pahalı modeli boşuna harcama

Her **yeni istekte** önce zorluğu ölç, sonra kimin yapacağına karar ver. Ana
oturum kolay işi kendisi yapmaz.

| | Kim yapar | Örnek |
| --- | --- | --- |
| **Kolay** | `triyaj` (haiku) yapar, ana oturum yalnızca diff'i ve `tsc`'yi kontrol eder | Yazım/etiket düzeltmesi, sabit değer değişimi, belge güncellemesi, kullanılmayan import temizliği, mevcut listeye aynı şekilde yeni kayıt |
| **Soru** | `kasif` (haiku) | "X nerede tanımlı", "Y akışı nasıl işliyor" |
| **Zor** | Ana oturum planlar; gerekirse `uygulayici` / `denetci` dağıtır | Çok dosyalı değişiklik, yeni ekran/veri modeli, bildirim & zamanlama, native taraf, sebebi bilinmeyen hata, tasarım/ürün kararı |

Ölçüt, `.claude/agents/triyaj.md` içinde ayrıntılı. Özet: tek dosya + ~20 satır
altı + istekten birebir anlaşılıyor + mevcut bir deseni tekrarlıyor → kolay.

> **Şüphedeysen zor say.** Yanlış "kolay" kararı kullanıcıya bozuk iş döndürür;
> yanlış "zor" kararı yalnızca biraz token harcar.

> ⚠️ Soru havuzu yazımı **kolay değildir**: teknik doğruluk gerektirir ve içerik
> doğrudan kullanıcıya gider. `uygulayici`'ya dar bir brifle verilir.

## Çalışma sırası

- Kullanıcı "devam" der ya da yeni bir iş belirtmezse `YAPILACAKLAR.md` → "Sıra" listesindeki **ilk tamamlanmamış** işe geçilir.
- Kullanıcının bir mesajındaki **her madde** ele alınır. Bu turda yapılamayan madde sessizce atlanmaz; nedeniyle birlikte `YAPILACAKLAR.md`'ye yazılır.
- Yapılan ama cihazda görülmemiş iş ✅ değil ⏳ olarak işaretlenir; "Cihazda doğrulanacaklar" listesine eklenir.

## Kurallar

- Doğrulama: `npx tsc --noEmit` — şu an **0 hata**, sıfırda kalmalı.
- Renkler `src/components/themeTokens.ts`'den gelir (marka değerleri `BRAND`); ekrana sabit renk gömülmez.
- Yeni `Pressable`'lara `accessibilityRole` + etiket.
- Yapay zekâ çağrıları `src/utils/aiAvailability.ts` kontrolünden geçer; kapalıyken teknik hata mesajı gösterilmez ve ekran çalışmaya devam eder.
- Yeni durum `createPersistentStore` / `createCollectionStore` deseniyle eklenir; ikinci bir state kütüphanesi eklenmez.
- Kayıt biriktiren yeni depo SQLite tablosu ister: `db.native.ts` → `MIGRATIONS` sonuna yeni göç + `SCHEMA_VERSION` artırımı.
- `assets/` kökündeki ikonlar elle düzenlenmez: `python3 tools/icon-forge/build_from_brand.py`.
- `app.json` → `expo.name` **ASCII kalır** (`Irtifa`); cihazda görünen ad `plugins/withDisplayName.js` (Android) ve `ios.infoPlist.CFBundleDisplayName` (iOS) üzerinden verilir. Gerekçe `DEVAM.md` "Ortam tuzakları" 6 — ASCII dışı ad prebuild'in Android paket türetmesini bozuyor.
- `npm install` sonrası `npx patch-package` elle çalıştırılır (postinstall çalışmıyor).
- Commit yalnızca kullanıcı isteyince. Biçim: `feat: …`, `fix: …`, `chore(assets): …`.
- Kalıcı bilgi: karar → `KARARLAR.md`, plan/durum → `YAPILACAKLAR.md`. `DEVAM.md` geçicidir.

## Orkestrasyon

Ana oturum (Opus) **planlar, böler, dağıtır, doğrular**. Uygulamayı alt ajanlar yapar.
Ajan tanımları `.claude/agents/` altında.

| Ajan | Model | İş | Yazar mı |
| --- | --- | --- | --- |
| `triyaj` | haiku | İsteği kolay/zor ayırır; **kolaysa kendisi yapar** | Evet (dar kapsam) |
| `kasif` | haiku | Kod tabanında keşif: "X nerede / nasıl çalışıyor" | Hayır |
| `uygulayici` | sonnet | Net tanımlı tek bir iş paketini uygular | Evet |
| `denetci` | sonnet | Değişikliği plana ve kurallara göre inceler | Hayır |
| `belgeci` | haiku | `YAPILACAKLAR` / `KARARLAR` / README günceller | Yalnız `.md` |

### Akış

1. **Anla** — Bilinmeyen alanlar için `kasif`'lere dar sorular sor; birbirinden bağımsızsa paralel.
2. **Planla** — İşi bağımsız paketlere böl. Çok dosyalı ya da kullanıcı kararı gerektiren işlerde planı önce kullanıcıya göster.
3. **Dağıt** — Her paket bir `uygulayici`. Aynı dosyalara dokunmayan paketler paralel (tek mesajda birden çok ajan çağrısı); aynı dosyaya dokunanlar sıralı.
4. **Doğrula** — `denetci` diff'i inceler. Ana oturum bulguları ve `tsc` sonucunu kendisi kontrol eder; düzeltmeyi aynı `uygulayici`'ya mesajla geri gönderir.
5. **Kaydet** — `belgeci` durum belgelerini günceller. Kullanıcıya kısa rapor: ne yapıldı, ne doğrulandı, ne açık kaldı.

### Ne zaman devredilmez

- Birkaç satırlık tek dosya değişikliği ya da tek `grep` ile bulunacak şey → ana oturum kendisi yapar. Ajan her seferinde bağlamı sıfırdan kurar, küçük işte pahalıdır.
- Tasarım / ürün kararı gerektiren sorular → ajana değil kullanıcıya.

### İş paketi şablonu

Alt ajan bu konuşmayı görmez; brif tek başına yetmeli.

```
Amaç: <tek cümle — ne ve neden>
Bağlam: <ilgili KARARLAR / YAPILACAKLAR bölümü, bilinen tuzaklar>
Dosyalar: <dokunulacaklar; açıkça dokunulmayacaklar>
Yapılacak: <adımlar>
Kabul kriterleri: <gözlenebilir koşullar>
Doğrulama: npx tsc --noEmit (+ varsa ek komut)
Rapor: değişen dosyalar, yapılmayanlar, şüpheli noktalar
```
