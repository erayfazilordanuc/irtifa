# İrtifa (React Native / Expo SDK 54)

**İrtifa**, mülakata ve iş hayatına hazırlanmak için yazılmış bir mobil
uygulamadır. İki ayağı var:

1. **Mülakat hazırlığı** — kurum bazlı canlı simülasyon, süre baskılı kriz
   senaryoları, hedef alana göre günlük alan testi, yapay zekâ değerlendirmesi
   ve mülakat karnesi.
2. **İş hayatı & kariyer yönetimi** — başvuru takibi, STAR cevap kurgusu,
   şirket araştırma notları, maaş görüşmesi provası ve mülakat sonrası takip.

Yanında mülakat başarısına hizmet eden nefes, diksiyon ve zihin egzersizleri yer
alır — genel yaşam rutini değil, komite karşısına çıkmadan önceki üç dakika.

Uygulama **sunucusuz ve çevrimdışı çalışır.** Yapay zekâ isteğe bağlı bir
katmandır; kapalıyken hiçbir ekran bozulmaz, yalnızca değerlendirme kapalı
kalır.

Yol haritası → [YAPILACAKLAR.md](YAPILACAKLAR.md) · verilmiş kararlar →
[KARARLAR.md](KARARLAR.md) · çalışma kuralları → [CLAUDE.md](CLAUDE.md).

---

## 🗂️ Sektör kataloğu — alan koda gömülü değil

Kullanıcı sektörünü ve hedef alanını **yazmaz, seçer**. Kurumlar, soru havuzu,
haber kaynakları ve yapay zekânın mülakatçı rolü seçilen kataloğa göre gelir
(`src/data/sectors.ts`).

| Sektör | Durum |
| --- | --- |
| Savunma sanayii | Kataloğun ilk girdisi — beş kurum, teknik soru havuzu, haber arşivi |
| Yazılım & teknoloji | Altı kurum, dokuz departman, teknik soru havuzu |

Hiçbir sektör ayrıcalıklı değil; uygulamanın adı, teması ve kimliği bir sektöre
bağlanmaz. Yeni sektör eklemek için katalog kaydı ve soru havuzu yeter, mimari
değişmez.

---

## 📱 Gezinme yapısı (5 sekme)

```
┌─────────┬──────┬────────┬─────────┬───────┐
│ Mülakat │ Kriz │ Atölye │ Kariyer │ Karne │
└─────────┴──────┴────────┴─────────┴───────┘
```

- **Mülakat (`InterviewHubScreen`)** — giriş ekranı. Günün iki işi (günün
  mülakatı + günün alan testi), özelleştirilmiş simülasyon, mülakat geçmişi ve
  sektör haberleri.
- **Kriz (`CrisisScreen`)** — baskı provası. Süresi kasıtlı dar kriz senaryoları
  (10 sn düşünme, 90 sn cevap) ve ayrı bir mod olarak maaş görüşmesi.
- **Atölye (`WorkshopScreen`)** — mülakat nefesi, mülakat diksiyonu, mülakat
  zekâsı ve kamera önü duruş pratikleri; günlük pratik listesi ve hatırlatıcılar.
- **Kariyer (`CareerScreen`)** — başvuru takibi, STAR cevapları, şirket notları,
  mülakat sonrası takip.
- **Karne (`ProgressScreen`)** — mülakat puanı, alan testi doğruluğu, egzersiz
  serileri, kasıtlı ölçümler ve gelişim eğrisi. Profil ve Ayarlar buradan açılır.

---

## 🎯 Günün alan testi

Hedef alana göre her gün **1 ağır + 2 kısa** soruluk bir set. Gün boyunca aynı
set gelir (`pickDailyFieldTest`, gün numarasına göre deterministik).

- Format **yalnızca yazılı**: kamera/mikrofon yok, izin istenmez. Ölçülen şey
  doğruluk, derinlik ve kapsam — akıcılık ve dolgu kelime metrikleri buraya
  uygulanmaz (onlar günün mülakatında ölçülür).
- Yapay zekâ açıkken üç cevap birlikte puanlanır; kapalıyken sorunun beklenen
  noktaları açılır ve kullanıcı kendi cevabını işaretler.
- Havuz kurumdan bağımsız, yalnızca alana bağlı; mülakat simülasyonu ve teknik
  soru bankasıyla **aynı** havuzdur.

---

## 🤖 Yapay zekâ: BYOK

Kullanıcı kendi Google Gemini anahtarını girer (*Bring Your Own Key*). Anahtar
cihazın kasasında saklanır (`expo-secure-store`), çağrılar doğrudan Google'a
gider, kullanım kullanıcının kendi kotasından düşer. **Ayakta tutulması gereken
bir sunucu yoktur.**

- Her çağrı `src/utils/aiAvailability.ts` kontrolünden geçer; anahtar yokken
  teknik hata mesajı gösterilmez.
- Yapay zekâ **değerlendirir ve üretir, kapıda durmaz**: hiçbir içeriğe erişmek
  ya da alıştırma yapmak için anahtar gerekmez.
- `server/server.ts` isteğe bağlı bir proxy olarak durur (Ayarlar → Yapay Zekâ →
  Gelişmiş). Kendi makinesinde çalıştırmak isteyen için; hız sınırı ve 15 sn
  zaman aşımı içerir.

⚠️ Gizlilik: yapay zekâ açıkken mülakat metni, ses kaydı ve duruş analizi için
yakalanan birkaç düşük çözünürlüklü kare doğrudan Google'a gider. Ses kaydı
cihazda kalıcı saklanır (`irtifa-audio/`).

---

## ⚙️ Gereksinimler

- **Node.js** v18+
- **JDK 17** — Android derlemesi için şart (sistemde JDK 26 varsa
  `openjdk@17` dışa aktarılmalı; ayrıntı `DEVAM.md` → "Ortam tuzakları").
- **Expo SDK 54** (`react-native` 0.81.5, NativeWind v4).

---

## 🚀 Kurulum

```bash
npm install
npx patch-package    # postinstall çalışmıyor, elle gerekiyor
```

⚠️ `patches/react-native-css-interop` yaması kritik: yoksa tema değiştirirken
gezinme bağlamı hatası geliyor.

⚠️ `app.json` → `expo.name` ASCII (`Irtifa`); cihazda görünen ad
`plugins/withDisplayName.js` ve `ios.infoPlist.CFBundleDisplayName` üzerinden
**İrtifa** olarak veriliyor. Gerekçe: ASCII dışı ad prebuild'in Android paket
adını bozuyor (`DEVAM.md` → "Ortam tuzakları" 6).

### Çalıştırma

```bash
npm run android      # geliştirme (native derleme dahil)
npm start            # Metro + QR (Expo Go)
```

İsteğe bağlı proxy sunucusu için `server/.env` (örnek: `server/.env.example`)
hazırlanıp `npm run server`.

### Derleme

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
cd android && ./gradlew assembleRelease
```

⚠️ Release varyantı şu an **debug keystore** ile imzalanıyor (Expo şablonu
varsayılanı). Play Store bunu kabul etmez; yayın öncesi gerçek keystore
üretilmeli (YAPILACAKLAR → Bölüm 6).

---

## 🎨 Marka

Kimlik: **lacivert zemin + zümrüt vurgu** — kurumsal, ciddi ve sektörsüz.
İşaret, noktası yukarı bakan bir oka dönüşmüş "İ" harfi: yükselme.

Renklerin tek kaynağı `src/components/themeTokens.ts` → `BRAND`. Ekrana sabit
renk gömülmez.

`assets/` kökündeki ikonlar **elle düzenlenmez**:

```bash
python3 tools/icon-forge/build_from_brand.py
```

Ayrıntı → [assets/brand/README.md](assets/brand/README.md).
