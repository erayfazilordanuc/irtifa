# Devam

> Geçici oturum notu. Kalıcı bilgi buraya yazılmaz: karar → `KARARLAR.md`,
> plan/durum → `YAPILACAKLAR.md`.
>
> Cihazda çalıştırma kuralları aşağıdaki "Ortam tuzakları"nda; onları okumadan
> build almaya çalışma.

---

## Proje ne

**İrtifa** — mülakat ve iş hayatına hazırlık uygulaması. Terakki'nin
kopyasından dönüştürüldü (2026-10-04/05); dönüşüm planı
[YAPILACAKLAR_İRTİFA.md](YAPILACAKLAR_İRTİFA.md).

Arayüz Türkçe. Açık + koyu tema. Ekranlar `src/screens/`, paylaşılan bileşenler
`src/components/AppUI.tsx` ve `src/components/practice/PracticeUI.tsx`, renk
kaynağı `src/components/themeTokens.ts`.

Yapay zekâ **BYOK**: kullanıcı kendi Gemini anahtarını girer, çağrı doğrudan
Google'a gider (`src/utils/geminiClient.ts`). `server/server.ts` isteğe bağlı bir
proxy; uygulama onsuz çalışır.

---

## Şu an nerede duruyoruz

**Dönüşüm kod tarafında bitti, `tsc` 0 hata.** Yapılanların özeti
`YAPILACAKLAR.md` → bölüm başlıkları; kısaca:

- Kimlik (ad, paket, depo/DB/ses klasörleri, bildirim ön ekleri) İrtifa oldu.
- Sektör kataloğu kuruldu (`src/data/sectors.ts`); kurum, departman, soru
  havuzu, haber kaynağı ve yapay zekâ rolü oradan geliyor.
- Dil/edebiyat/dinî modüller ve genel yaşam hatırlatıcıları söküldü.
- Beş sekme: Mülakat · Kriz · Atölye · Kariyer · Karne.
- Yeni özellikler: günün alan testi, kriz senaryoları, maaş görüşmesi, başvuru
  takibi, STAR kurucu, şirket notları, mülakat sonrası takip.
- Marka: yükselen İ işareti, lacivert + zümrüt palet, ikonlar yeniden üretildi.
- Soru havuzu: 229 soru (genel 19, savunma 113, yazılım 81, kriz 8, maaş 8).

### ⚠️ Hiçbiri cihazda görülmedi

**En önemli açık iş bu.** Dönüşümün tamamı yalnızca `tsc` ve saf Node
betikleriyle doğrulandı. `YAPILACAKLAR.md` → "Cihazda doğrulanacaklar" listesi
sırasıyla izlenmeli; ilk üç madde:

1. `npx expo prebuild --clean` sonrası uygulama açılıyor mu (native modüller).
2. **Sesli mülakat analizi** — ses MIME türü `audio/m4a` → `audio/mp4` değişti
   ve hiç denenmedi. İrtifa'nın can damarı.
3. **SQLite şema v4 göçü** — `applications` ve `star_stories` tabloları.

Terakki'den devralınan doğrulanmamış işler de o listede; orada bulunan hata
büyük olasılıkla Terakki'de de duruyor, oraya da bildirilmeli.

### Native projeler yeniden üretildi (2026-10-05)

`npx expo prebuild --clean` çalıştırıldı; `ios/Terakki/` gitti, yerine yeni
proje geldi. Üretilen değerler doğrulandı: iOS ve Android splash zemini
`#0F172A`, adaptif ikon zemini `#0F172A`, bildirim rengi `#10B981`,
`applicationId = com.irtifa.app`, görünen ad her iki platformda **İrtifa**.
`npx patch-package` sonrası yama yerinde (tuzak 2 kontrolü `1` döndü).

**Android debug derlemesi geçti** (`./gradlew assembleDebug` → `app-debug.apk`).
Yol üstünde tuzak 7 bulundu ve çözüldü (aşağıda).

**`ios/` ve `android/` artık depoda tutulmuyor.** Terakki'de `ios/` izleniyordu
çünkü açılış ekranı ve ikonlar elle düzenlenmişti; İrtifa'da elle düzenlenen
native dosya yok — hepsi `app.json`'dan üretiliyor. Klasörler `.gitignore`'da;
yeni bir makinede:

```bash
npm install && npx patch-package
npx expo prebuild --clean
npm run android
```

---

## Ortam tuzakları — build almadan önce oku

Hepsi bu projede (ve kaynağı Terakki'de) gerçekten başa geldi.

### 1. JDK 17 şart, sistemde JDK 26 var

`~/.zshrc` düzeltildi. Doğru değer:

```sh
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

⚠️ `$(/usr/libexec/java_home -v 17)` **KULLANMA**. Brew'in `openjdk@17`'si
`/Library/Java/JavaVirtualMachines/` altına kayıtlı olmadığı için `java_home`
onu bulamıyor ve sessizce JDK 26'yı döndürüyor. Belirti:

```
Error resolving plugin [id: 'com.facebook.react.settings']
> 26.0.1
```

⚠️ Ayrıca: editörden açılan kabuk `~/.zshrc`'yi okumayabiliyor. Gradle
çalıştıran her komutta `JAVA_HOME`'u **açıkça** dışa aktar.

### 2. `npm install` sonrası yamayı geri koy

`patches/react-native-css-interop+0.2.4.patch` **kritik**. NativeWind'ın
`stringify()`'ı prop'ları özyinelemeli geziyor ve React Navigation'ın
`NavigationStateContext` varsayılanındaki patlayan getter'lara çarpıyor.

Belirti (tema değiştirirken):
```
Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?
```

npm bu projede lifecycle script'lerini engelliyor, yani `postinstall` çalışmıyor.
Her `npm install` / `expo install` sonrası elle:

```bash
npx patch-package
grep -c "Getter Error" node_modules/react-native-css-interop/dist/runtime/native/render-component.js   # 1 dönmeli
```

Sonra Metro'yu `npx expo start --clear` ile başlat.

> `expo prebuild` bu yamayı bozmuyor — `npm install` çalıştırmıyor. Yine de
> prebuild sonrası bir kez kontrol et.

### 3. Telefon USB'den çıkıp girdiyse

`adb reverse` eşlemesi kaybolur, uygulama splash'ta takılır. Yeniden derleme
gerekmez:

```bash
adb reverse tcp:8081 tcp:8081
```

### 4. Prebuild, `android/` klasörü varken çalışmaz

`expo run:android`, `android/` klasörü duruyorsa prebuild'i tekrar çalıştırmaz;
`app.json`'daki değişiklikler (kimlik, izin metinleri, eklenti ayarları)
uygulanmaz. Değişiklikten sonra:

```bash
npx expo prebuild --clean
```

Doğrulama örneği (cleartext HTTP, isteğe bağlı proxy için gerekiyor):

```bash
grep -o 'usesCleartextTraffic="[^"]*"' android/app/src/main/AndroidManifest.xml
```

⚠️ **İrtifa'da prebuild yasağı yok** — Terakki'de `ios/` altındaki özelleştirmeler
elle düzenlendiği için yasaktı. Burada kimlik değiştiği için temiz prebuild
**gerekiyor**; sonrasında iOS splash renk kümesi yeniden ayarlanmalı.

### 5. `expo-av` deprecated

SDK 54'te kaldırılacağını söylüyor, proje SDK 54'te. Çalışıyor;
`expo-audio` + `expo-video`'ya geçiş yol haritasında.

### 6. `expo.name` ASCII olmalı — görünen ad ayrı veriliyor

**Belirti:** Android derlemesi şu hatayla düşüyor:

```
MainApplication.kt: Unresolved reference 'BuildConfig'
MainActivity.kt:    Unresolved reference 'BuildConfig'
```

**Neden:** `app.json` → `expo.name` hem cihazda görünen adı hem de **native
proje adlarını** belirliyor. Ad ASCII dışı bir harfle başlayınca ("İrtifa"daki
"İ") prebuild Android paket adını yanlış türetiyor: dosyalar `com/irtifa/app/`
altına yazılıyor ama Kotlin dosyalarının paket satırı `package com.irtifa`
oluyor. `BuildConfig` ise `com.irtifa.app` paketinde üretiliyor, yani Kotlin
onu göremiyor. iOS tarafında da proje klasörü `ios/rtifa/` oluyordu ("İ"
tamamen düşüyordu).

**Çözüm (uygulandı):** `expo.name` ASCII tutuluyor (`Irtifa`), görünen ad iki
yerden veriliyor:

- Android → `plugins/withDisplayName.js` (`strings.xml` → `app_name`)
- iOS → `app.json` → `ios.infoPlist.CFBundleDisplayName`

⚠️ İkisi birlikte değişmeli. Doğrulama:

```bash
head -1 android/app/src/main/java/com/irtifa/app/MainApplication.kt   # package com.irtifa.app
grep app_name android/app/src/main/res/values/strings.xml             # İrtifa
grep -A 1 CFBundleDisplayName ios/Irtifa/Info.plist                   # İrtifa
```

### 7. İkon betiği artık serbest

`build_from_brand.py` güncel: `assets/brand/ikon/irtifa-icon-*.svg` okuyor ve
`assets/` kökündeki ikonları üretiyor. (Terakki'deki "şimdilik çalıştırma"
uyarısı degrade kararı açıkken geçerliydi; İrtifa'da yeni marka kuruldu.)

---

## Bilinen, dokunulmayan izler

- `Segmented`'in seçili seçeneği açık temada `shadow-sm` alıyor; sınıf yalnızca
  seçiliyken eklendiği için NativeWind her seçimde "components … will remount"
  uyarısı basıyor. Görsel aksama yok.
- Tema değişimi tüm ağacı yeniden render ediyor (`useThemeTokens` her bileşende
  bağlama abone).
- `EXERCISE_CATEGORIES`'te `oksipital` hâlâ tek egzersizli.
- Haber arşivi (`news.ts` → `ARCHIVE_ENTRIES`) yalnızca savunma girdileri
  taşıyor; yazılım sektörü seçiliyken yıl sekmeleri boş görünür.
- Savunma departmanlarının soru havuzu dengesiz: `sv-gomulu` 30 soru (pilot),
  diğerleri 8–12. Yazılım tarafı dokuz alanda eşit (9'ar).
- Kökteki `notes` dosyası kullanıcının kendi notu; `.gitignore`'da.
