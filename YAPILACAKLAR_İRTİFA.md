# 🚀 YAPILACAKLAR_İRTİFA.md
## İrtifa: Mülakat & İş Hayatı — AI Destekli Hazırlık ve Kariyer Uygulaması

**Son Güncelleme:** 2026-10-04  
**Proje Kapsamı (karar 2026-10-04):** **Mülakat ve iş.** İki ayak: (1) *mülakat
hazırlığı* — kurum bazlı canlı simülasyonlar, süre baskılı kriz/stres testleri,
günlük alan testi, yapay zekâ analizi ve mülakat karnesi; (2) *iş hayatı &
kariyer yönetimi* — başvuru takibi, STAR cevap kurgusu, şirket araştırma
notları, maaş görüşmesi, mülakat sonrası takip. Yanında mülakat başarısına
hizmet eden nefes/diksiyon/zihin egzersizleri.

**Savunma sanayii, tek alan değil ilk alan.** Hazır içerik (ASELSAN, BAYKAR,
TUSAŞ, ROKETSAN, HAVELSAN; savunma soru bankası ve haberleri) kataloğun ilk
girdisi olarak kalır; uygulama genele açıldığı için sektör **seçilebilir** olur
(Bölüm 00). Uygulamanın adı ve kimliği hiçbir sektöre bağlanmaz.

---

## 🧭 Bu dosya nasıl kullanılır — dönüştürecek ajan için

**Durum:** Elindeki kod tabanı **Terakki'nin birebir kopyası** — çalışan,
derlenen bir Expo SDK 54 / RN 0.81 / NativeWind v4 uygulaması. Sıfırdan bir
uygulama yazmıyorsun; bu kodu **İrtifa'ya dönüştürüyorsun.** Aşağıdaki bölümler
o dönüşümün planı, bir istek listesi değil.

**İrtifa, kardeşleri arasında Terakki'ye en yakın olan.** Mülakat motoru, kurum
listesi, soru bankası, yapay zekâ analizi ve mülakat geçmişi **zaten var ve
çalışıyor**; iş çoğunlukla *budama* ve *odaklama*, yeniden yazım değil. Yeni
yazılacak asıl özellik Bölüm 3 (Günün Alan Testi).

**Dokunmadan önce, bu sırayla:**

1. Bu dosyayı sonuna kadar oku — özellikle aşağıdaki ⛔ bölümü ve Bölüm 3'ün kararları.
2. `CLAUDE.md` → çalışma kuralları; `DEVAM.md` → "Ortam tuzakları" (build ya da
   `npm install` öncesi **zorunlu**).
3. **Bölüm 0'u (kimlik ayrımı) yap.** Başka hiçbir şeye dokunmadan önce.

### Devralınan belgeler — hangisi geçerli

| Belge | Bu projede |
| --- | --- |
| `CLAUDE.md` | **Kuralları geçerli:** renkler `themeTokens.ts`'den gelir (ekrana sabit renk gömülmez), `npx tsc --noEmit` 0 hatada kalır, yeni `Pressable`'a `accessibilityRole` + etiket, yapay zekâ çağrıları `aiAvailability.ts` kontrolünden geçer ve **kapalıyken teknik hata mesajı gösterilmez**, `npm install` sonrası elle `npx patch-package`, ikonlar elle düzenlenmez. **Geçersiz:** uygulama adı ve kapsam cümlesi — Bölüm 0'da güncellenir. |
| `KARARLAR.md` | **Teknik** kararlar devralınır: SQLite'a aşamalı geçiş, yeni durum `createPersistentStore` deseniyle (ikinci bir state kütüphanesi eklenmez), **BYOK** (*Bring Your Own Key* — yapay zekâ kullanıcının kendi Google Gemini anahtarıyla çalışır, anahtar cihazın kasasında saklanır, çağrılar doğrudan Google'a gider ve kullanım kullanıcının kendi kotasından düşer; ayakta tutulacak sunucu yok. İrtifa'nın yapay zekâ katmanının temeli bu), mülakat ses kayıtlarının cihazda kalıcı saklanması, bildirim planlaması tek yönlü, iOS 64 bekleyen bildirim sınırı ve bütçe, ölçüm skalası norm uydurmaz. **Ürün** kararları devralınmaz: uygulamanın adı, yedi sütun kapsamı, dinî mod. |
| `YAPILACAKLAR.md` | Terakki'nin yol haritası. Burada **referans, görev listesi değil** — iki istisnası var, ikisi de İrtifa'ya **devredildi** ve aşağıda kendi bölümleri olarak duruyor: **Bölüm 00 aşama 2** (alanı kataloğa taşı → bu dosyada Bölüm 00; Terakki'deki "Bugünkü hâl" tablosu sektörün koda gömülü olduğu bütün yerleri satır satır gösteriyor, **oku**) ve **Bölüm 3 → "İleride"** (başvuru takibi, STAR kurucu, şirket notları, maaş görüşmesi, mülakat sonrası takip → bu dosyada Bölüm 2.5). Ayrıca işine yarar: Bölüm 0.4 (SQLite), Bölüm 1/2/6 (nefes, zihin, diksiyon — İrtifa'da mülakata uyarlanıyor), Bölüm 5 (ölçüm kuralı). Bölüm 7 (lugat & belagat) ve Bölüm 9 (dinî mod) İrtifa'da geçersiz. |
| `YAPILACAKLAR_ARSIV.md` | **Silme.** Koddaki `YAPILACAKLAR Bölüm X` yorumları buraya bakıyor; silinirse o atıflar boşa düşer. |
| `YAPILACAKLAR_FESAHAT.md` | Kardeş uygulamanın (dil, konuşma, anlayış, kavrayış, iletişim) planı. Burada geçersiz — sil. |
| `DEVAM.md` | Geçici oturum notu ve **bir kısmı eskimiş** (ör. "yapay zekâ `server/server.ts` üzerinden, anahtar yalnızca sunucuda" artık doğru değil; BYOK'a geçildi). Yalnızca "Ortam tuzakları" bölümüne güven. |

### ⚠️ Devralınan kod cihazda doğrulanmadı

Terakki kopyalandığı anda son iş turları **yalnızca `tsc` ile** doğrulanmıştı,
telefonda görülmemişti. İrtifa'nın çekirdeğini doğrudan ilgilendirenler:

- **BYOK yapay zekâ akışı** — anahtar kasası (`expo-secure-store`), kurulum
  ekranı, geçersiz anahtar hatası, anahtar kaldırılınca uygulamanın bozulmaması.
- **Sesli mülakat analizi** — ses MIME türü `audio/m4a` → `audio/mp4` olarak
  değişti (m4a Gemini'nin desteklenen türler listesinde yok) ve **hiç
  denenmedi**. İrtifa'nın can damarı burası; ilk build'de önce bunu sına.
- **Mülakat ses kaydı saklama** — yarıda çıkışta "Kaydet ve çık" akışı, kaydın
  Mülakat Geçmişi'nden dinlenebilmesi.
- **SQLite v3 göçü** (`practice_responses`) ve Yanıt Defteri.

Terakki'nin `YAPILACAKLAR.md` → "Cihazda doğrulanacaklar" listesi **bu projeye
de geçerlidir**. Bulduğun hata büyük olasılıkla Terakki'de de duruyor — bildir.

### ⚠️ Terakki'nin prebuild yasağı burada tersine döner

Terakki'de `npx expo prebuild` **yasak**, çünkü `ios/` altındaki açılış ekranı
ve ikon özelleştirmeleri elle düzenlenmiş ve prebuild onları eziyor. Bu projede
uygulamanın **adı ve paket kimliği değişiyor**, native proje klasörü ise hâlâ
`ios/Terakki/` — yani temiz bir prebuild **gerekiyor**. Sıra:

1. `app.json`'u Bölüm 0'a göre güncelle.
2. `npx expo prebuild --clean`.
3. Açılış ekranı ve ikon özelleştirmelerini yeni native projeye tekrar uygula
   (iOS `SplashScreenBackground.colorset` dahil).
4. `npx patch-package` ile yamayı doğrula — `patches/react-native-css-interop`
   yaması kritik, yoksa tema değiştirirken gezinme bağlamı hatası geliyor.

---

## 0. 🪪 Kimlik ayrımı — ilk iş, her şeyden önce

Ad ve kimlik sabitleri dönüşümün **başında** değişir. Şimdi bedava: uygulamanın
kullanıcısı ve verisi yok. Yayından sonra aynı değişiklik veri göçü kodu
gerektirir. (Bölüm 5'teki `app.json` maddesi bunun parçası; ikisi birlikte
yapılır.)

- [ ] **`app.json`** → `name: "İrtifa"`, `slug`, `ios.bundleIdentifier` ve
      `android.package`: `com.irtifa.app` (bugün `Terakki` / `terakki` /
      `com.terakki.app`).
      ⚠️ Paket kimliği Terakki'yle aynı kalırsa aynı telefonda biri diğerinin
      **üstüne kurulur**; üç uygulamanın yan yana durması için üçünün de ayrı
      kimliği olmalı.
- [ ] **Depo klasörleri** — `src/utils/storage.ts:27` ve `src/utils/db.native.ts:24`: `STORE_DIR = 'savunma-store'` (uygulamanın ilk adından kalma artık), `db.native.ts:25`: `DB_NAME = 'terakki.db'`.
- [ ] **Ses klasörü** — `src/utils/audioStore.ts:20`: `AUDIO_DIR = 'terakki-audio'`. İrtifa'da mülakat ses kaydı **kalıyor**, o yüzden katman korunur, yalnızca yeniden adlandırılır.
- [ ] **Bildirim kimlik ön ekleri** `terakki.*` → `src/utils/dailyNotifications.ts:29-33`, `src/utils/habitPlan.ts:129`, `src/utils/alarmPlan.ts:113,122`.
- [ ] **Marka** — `assets/brand/` içeriği ve marka renkleri yeni kimliğe göre (Bölüm 4'teki taktiksel koyu tema ile birlikte kararlaştırılır). İkonlar **elle düzenlenmez**: `python3 tools/icon-forge/build_from_brand.py`. ⚠️ `DEVAM.md` "Ortam tuzakları" 6'daki "betiği şimdilik çalıştırma" uyarısı Terakki'ye özeldi (degrade kararı açıktı); burada yeni marka kurulduğu için geçerli değil.
- [ ] **Belgeler** — `CLAUDE.md` ve `README.md`: yeni ad ve kapsam. `CLAUDE.md`'deki "yapay zekâ katmanı isteğe bağlı, uygulama sunucusuz da %100 çalışmalı" kuralı **aynen kalır** — İrtifa'da da anahtar yokken çevrimdışı soru havuzu devreye girer (Bölüm 4).

---

## ⛔ Terakki'ye özel içerik: **İrtifa'ya eklenmeyecek**

Terakki'de dinî içerik modu açıkken gösterilen **günün Risale-i Nur vecizesi**
(`src/data/risale.ts`, `DailyVecizeCard`) ve **günün duası** kartları
Terakki'nin sahibine özel içeriklerdir.

**İrtifa'ya taşınmayacak.** Gerekçe: İrtifa savunma sanayii mülakat
simülatörüdür; kurumsal bir işe hazırlık aracında dinî içerik kapsam dışıdır.
Terakki'den kod taşınırken `risale.ts`, `DAILY_PRAYERS`, `DailyPrayerCard`,
`DailyVecizeCard` ve `religiousMode` ayarı **alınmaz**.

---

## 🎯 Mülakat Odaklı Egzersiz Yaklaşımı

Uygulamada egzersizler yer alır; ancak genel yaşam rutinleri için değil, **doğrudan mülakat başarısını ve soğukkanlılığını artırmak** amacıyla mülakatsal senaryolara uyarlanmıştır:

1. **Mülakat Heyecan Kontrolü (Nefes & Ses)**: Mülakat komitesi karşısına çıkmadan önceki 3 dakikalık heyecan yatıştırma, ses titremesini engelleme ve diyafram desteğiyle özgüvenli konuşma.
2. **Mülakat Akıcılığı & Diksiyon**: Mülakatta duraklamaya yol açan dolgu kelimeleri ("şey, yani, eee") temizleme, teknik terimleri anlaşılır telaffuz etme (artikülasyon).
3. **Baskı Altında Düşünme (Mülakat Zekası)**: Kriz sorularına anında 3 alternatif çözüm kurgulama, STAR yöntemiyle hızlı cevap yapılandırma.

---

## 00. 🗂️ Sektör kataloğu — alanı koddan çıkar

**Terakki'den devredildi** (2026-10-04). Terakki tek kullanıcılı olduğu için o
işin orada karşılığı kalmadı; genele açılan mülakat uygulaması İrtifa olduğuna
göre katalog buranın işi.

**İlke (Terakki KARARLAR'dan devralındı):** *sistemi uygulama versin, alanı
katalog versin.* Alan koddan çıkar ama kullanıcıya değil **hazır kataloğa**
gider — kullanıcı sektör/kurum yazmaz, **seçer**.

Bugün sektör beş yere gömülü. Terakki `YAPILACAKLAR.md` → Bölüm 00 aşama 2'deki
"Bugünkü hâl" tablosu aynısını veriyor:

| Bulgu | Yer |
| --- | --- |
| Kurumlar bir **tip** olarak sabit | `src/data/companies.ts` → `CompanyId = 'aselsan' \| 'roketsan' \| …` |
| Bölümler üçle sınırlı | `src/data/questions.ts` → `DEPARTMENTS` (yazilim, arge, ik) |
| Haber akışı sektöre kilitli | `src/data/defenseNews.ts` |
| Yapay zekâ istemleri sektöre kilitli | `AnalysisScreen.tsx:116`, `InterviewHistoryScreen.tsx:35` ("Sen Türk savunma sanayii…") |
| Uygulama hiçbir sunucuyla gelmiyor | `appSettings.ts` → `DEFAULT_API_BASE_URL = ''` (BYOK sonrası sorun değil) |

- [ ] **`CompanyId` → serbest kimlik + katalog.** Birleşim tipi yerine katalog
      kaydı; savunma sanayii kataloğun **bir girdisi** olur, ayrıcalıklı değil.
- [ ] **İlk katalog içeriği: Savunma sanayii + Yazılım & teknoloji.** Yazılım
      tarafı için şirketler, bölümler (ör. backend, mobil, veri, ürün, DevOps),
      soru bankası ve haber kaynakları hazırlanacak.
- [ ] **Haber akışı sektör parametreli** — `defenseNews.ts` adı ve içeriği
      sektöre bağımsız hâle gelir (`news.ts` + sektör etiketi).
- [ ] **Yapay zekâ istemleri katalog seçiminden üretilir** — "Sen Türk savunma
      sanayii mülakat kurulu üyesisin" sabiti kalkar, rol seçilen sektörden
      kurulur.
- [ ] **Sektör seçimi oryantasyona bir adım olarak eklenir** ve Ayarlar'dan
      değiştirilebilir; `Profile`'da saklanır (Bölüm 3'teki hedef departman
      tercihiyle aynı yerde).

⚠️ **Sıra:** bu iş Bölüm 2.5 (iş hayatı) ve Bölüm 3 (alan testi) içeriklerinden
**önce** gelir. Sonra yapılırsa savunma varsayımı yeni özelliklere de gömülür
ve iki kez sökülür. Bölüm 3'teki alan/departman kırılımı da kataloğa bağlı:
departman listesi seçilen sektöre göre değişir (savunmada aerodinamik, yazılımda
backend).

---

## 1. 🧹 Temizlik ve Budama (Pruning)

Mülakatla doğrudan ilişkisi olmayan edebi/genel içerikler sökülecektir:

- [ ] **Mülakat Dışı Edebi İçeriklerin Kaldırılması:**
  - [ ] `src/data/belagat.ts` (Meânî, Beyân, Bedî' edebi sanatlar müfredatı) dosyasının silinmesi.
  - [ ] `src/data/dailyTexts.ts` (Edebi okuma metinleri) dosyasının silinmesi.
  - [ ] `src/screens/BelagatExerciseScreen.tsx` ve `src/screens/DailyTextScreen.tsx` ekranlarının silinmesi.

- [ ] **Mülakat Dışı Rutinlerin Temizliği:**
  - [ ] `src/utils/dailyPracticeSettings.tsx` içerisinden `religiousMode`, `dailyText`, `belagat` ayarlarının çıkarılması.
  - [ ] Genel yaşam hatırlatıcılarının (su içme, göz molası vb.) kaldırılarak sadece **Mülakat Öncesi Hazırlık ve Pratik Hatırlatıcıları**nın bırakılması.

  > ⚠️ **Bu liste 2026-09-10'da yazıldı; Terakki'ye o günden sonra lugat modülü
  > ve Yanıt Defteri eklendi.** Dil & ifade tarafının tamamı **Fesahat'ın**
  > kapsamına giriyor, İrtifa'da kalmaz:

  - [ ] `src/data/lugat.ts`, `src/utils/lugatProgress.ts` ve `src/screens/LanguageScreen.tsx` (Dil & İfade ekranı, dört sekme) silinmesi.
  - [ ] `src/data/risale.ts` silinmesi (yukarıdaki ⛔ bölümü) ve `dailyNotifications.ts:31-33`'teki `belagat` / `dailyText` / `lugat` bildirim kayıtlarının çıkarılması.
  - [ ] **Yanıt Defteri beş sekmeden üçe iner** — `src/screens/ResponseJournalScreen.tsx:50-66`: `belagat` ve `lugat` sekmeleri, ton eşlemeleri ve boş-durum metinleri çıkar; kalan: Tümü · Egzersiz · Mülakat. Ekran tamamen silinmez, mülakat sekmesi İrtifa'nın işine yarıyor.
  - [ ] ⚠️ `src/utils/spacedRepetition.ts` **silinmez** — lugat için yazıldı ama Bölüm 2.5'teki teknik soru bankasında aralıklı tekrar için devralınıyor.
  - [ ] ⚠️ `src/data/exercises.ts` ve `src/data/dictionDrills.ts` **silinmez** — Bölüm 2'deki Mülakat Hazırlık Atölyesi (nefes, diksiyon, zihin) bunlara dayanıyor; yalnızca mülakatla ilgisi olmayan kayıtlar budanır.
  - [ ] Tarama ile doğrulama: `grep -rn "lugat\|belagat\|risale\|dailyText" src/` yalnızca budanmış kayıtları göstermeli; `npx tsc --noEmit` 0 hata.

---

## 2. 🏛️ Mimari ve Navigasyon Yapılandırması

Uygulamanın 4 ana sekmesi mülakata hazırlık sürecine göre dizayn edilecektir:

- [ ] **Sekme 1: Canlı Mülakat (Simülasyon Hub'ı)**:
  - [ ] `src/screens/InterviewScreen.tsx` ana giriş noktası.
  - [ ] Kurum (ASELSAN, BAYKAR, TUSAŞ vb.) ve pozisyon seçimi.
  - [ ] `DailyInterviewScreen.tsx` (Günlük 3 Soru) ve `CustomInterviewScreen.tsx` (Derinlemesine Senaryo).

- [ ] **Sekme 2: Kriz Masası (Baskı & Stres Testi)**:
  - [ ] Canlı sayaçlı kriz yönetimi soruları ve stres simülatörü.

- [ ] **Sekme 3: Mülakat Hazırlık Atölyesi (Egzersizler)**:
  - [ ] **Mülakat Nefesi**: Heyecan yatıştırma & ses titremesi önleme (`DiaphragmExerciseScreen.tsx`).
  - [ ] **Mülakat Diksiyonu**: Dolgu kelime avı & konuşma temposu (`SpeechExerciseScreen.tsx`).
  - [ ] **Mülakat Zekası**: Terim hatırlama & STAR cevap kurgusu (`BrainExercisesScreen.tsx`).

- [ ] **Sekme 4: Mülakat Karnesi & Profil**:
  - [ ] `src/screens/ProgressScreen.tsx` ekranında AI puanları, akıcılık geçmişi, dolgu kelime sayaçları ve mülakat geçmişi (`InterviewHistoryScreen.tsx`, `AnalysisScreen.tsx`).

---

## 2.5. 💼 İş Hayatı & Kariyer Yönetimi

**Terakki Bölüm 3 → "İleride" listesinden devredildi** (2026-10-04). İrtifa'nın
kapsamı "mülakat **ve iş**" olduğu için bu ayak süs değil, uygulamanın ikinci
yarısı: mülakat tek seferlik bir olay, iş arama süreci haftalar sürüyor.

Hiçbiri Terakki'de yazılmadı; sıfırdan iş. Hepsi çevrimdışı çalışır (yapay zekâ
yalnızca metin önerisinde devreye girer, şart değil).

- [ ] **Başvuru takibi** — şirket, pozisyon, aşama, tarih, sonuç; basit liste ya
      da kanban. Yeni depo `createPersistentStore` deseniyle; kayıt birikeceği
      için SQLite tablosu düşünülmeli (Bölüm 0.4 deseni).
- [ ] **STAR cevap kurucu** — Durum → Görev → Eylem → Sonuç şablonuyla yaz,
      kaydet, mülakat öncesi tekrar et. Mülakat Hazırlık Atölyesi'ndeki "Mülakat
      Zekası" egzersiziyle (STAR ile hızlı cevap yapılandırma) aynı dili
      kullanmalı — biri alıştırma, biri kalıcı kayıt.
- [ ] **Şirket araştırma notları** — şirket başına not; o şirketle simülasyon
      başlatılırken hatırlatılır. Katalogdaki kurum kaydına bağlanır (Bölüm 00).
- [ ] **Maaş görüşmesi senaryosu** — ayrı simülasyon modu. Kriz Masası'ndan
      farkı: baskı değil **pazarlık**; aralık belirleme, karşı teklif, sessizlik.
- [ ] **Mülakat sonrası takip** — teşekkür mesajı şablonu ve öz-değerlendirme
      formu; başvuru takibindeki ilgili kayda bağlanır.
- [ ] **Teknik soru bankası** — departman bazlı; yanlış bilinen soru tekrar
      havuzuna düşer. ⚠️ Bölüm 3'teki alan testi havuzuyla **aynı havuz**
      olmalı, ikinci bir soru deposu kurulmaz; aralıklı tekrar için Terakki'nin
      `spacedRepetition.ts` deseni devralınır.

---

## 3. 🎯 Günün Alan Testi (Hedef Departmana Göre Günlük Soru)

Bugün **günün mülakatı** var (`pickDailyInterview`, `src/data/questions.ts:301`):
kurumu ve soruyu gün numarasına göre deterministik seçiyor, havuzu `type: 'genel'`.
Bunun yanına ikinci bir günlük iş eklenecek: kullanıcının **hedef departmanına**
göre her gün bir **alan testi** — küçük bir soru seti. Günün mülakatı genel kalır
(ileride teknik de olabilir), alan testi her zaman departman odaklıdır.

### Kararlar (2026-10-04)

**1. Set yapısı: tek soru değil, 1 sağlam + 2 kısa.** Günlük set üç sorudan
oluşur: biri **ağır** (açık uçlu, muhakeme ve gerekçe isteyen, alanın özüne
dokunan), ikisi **kısa** (terim/tanım, hızlı hesap, küçük senaryo). Neden: tek
soru günü temsil etmiyor, beş soru günlük alışkanlığı yük hâline getiriyor; ağır
soru derinliği, kısa sorular kapsamı veriyor. Sağlam soru sette **her zaman bir
tane** — ikiye çıkarsa günlük iş bırakılır.

**2. Format yalnızca yazılı.** Alan testinde kamera ve mikrofon **yok**. Cevap
klavyeden yazılır. Neden: alan testi bilgi ölçer, sunum değil; günün mülakatı
zaten kamera/ses tarafını karşılıyor. Yazılı akış kısa, her gün tekrar edilebilir
ve izin istemiyor.

- Sonucu: `audioStore` / `captureBuffer` yolu bu akışta hiç kullanılmaz.
- Sonucu: akıcılık, konuşma temposu ve dolgu kelime metrikleri alan testine
  **uygulanmaz** — karnede ayrı metrik gerekir (doğruluk, derinlik, kapsam).

**3. Çeşitlilik: üretken AI katmanı + yerel havuz tabanı.** Soru çeşitliliği
alan testinin can damarı; aynı soruların dönmesi özelliği öldürür. İki katman:

- **Taban (zorunlu): yerel havuz.** Yapay zekâ bu projede isteğe bağlı, anahtar
  kullanıcının kendi anahtarı (BYOK). Anahtar yokken de alan testi çalışmalı, bu
  yüzden yerel havuz her hâlükârde genişletilir.
- **Üst katman (araştırılacak): soru üreten AI agent.** Anahtar varken
  departman + seviye + gün durumuna göre soru üretir. Taze içerik sorunu kökten
  çözer, ama belirsizlikleri var (aşağıda).

Hangisinin ne kadar yük taşıyacağına **bakılacak**; karar o ölçümden sonra.

### Yapılacaklar

- [x] **Kalıcı "hedef departman" tercihi** — ✅ **Terakki'de yapıldı (2026-10-04), kopyayla hazır geliyor.** ⏳ Cihazda doğrulanacak.
  - [x] `Profile` tipine `targetDepartment: DepartmentId | ''` alanı eklendi (`src/utils/profile.ts`); `''` = seçilmedi. Katalog değişince kaybolan departman kimliği `''`'e düşürülüyor.
  - [x] Profil → Hedef ve tercihler → **Hedef Alan** satırı + aynı alt sayfada çip seçimi; seçili çipe tekrar dokunmak seçimi kaldırıyor.
  - [x] `careerContext()` artık hedef alanı da cümleye katıyor — yapay zekâ istemi departmanı biliyor.
  - [x] `pickDailyTechnical(department, date)` (`src/data/questions.ts`) — hedef alanın günün teknik sorusu, gün numarasına göre deterministik.
  - [x] Bugün sekmesinde tek satırlık **mülakat şeridi** (`DailyInterviewStrip`): sol günün genel sorusu, sağ hedef alanın günün teknik sorusu; alan seçilmemişse "Alan seç" → Profil.
  - [ ] **Kalan:** oryantasyona (`OnboardingScreen.tsx`) hedef alan adımı eklenmedi — şu an yalnızca Profil'den seçiliyor.
  - [ ] **Kalan:** `CustomInterviewScreen.tsx:27` hâlâ kendi geçici state'ini kullanıyor (`useState<DepartmentId>('yazilim')`); varsayılanı `profile.targetDepartment` olmalı.

- [ ] **Alan kırılımının genişletilmesi — kataloğa bağlı** (Bölüm 00). `DepartmentId` şu an `yazilim / arge / ik`, üçü de sektörsüz; oysa departman **seçilen sektörün altında** anlam kazanıyor. Departman listesi sektör kaydından gelir.
  - [ ] *Savunma sanayii* adayları: gömülü yazılım, elektronik & donanım, RF & haberleşme, kontrol & güdüm, aerodinamik, yapısal/mekanik tasarım, malzeme, sistem mühendisliği, görüntü işleme & yapay zekâ, test & doğrulama, kalite, üretim/imalat, proje yönetimi, İK.
  - [ ] *Yazılım & teknoloji* adayları: backend, frontend, mobil, veri & analitik, yapay zekâ/ML, DevOps & altyapı, güvenlik, gömülü, QA & test, ürün yönetimi, UI/UX, İK.
  - [ ] Listeler budanacak/onaylanacak — hepsini doldurmak soru havuzu yükü demek (aşağıya bak).
  - [ ] `Department` kaydına seviye/kapsam alanları eklenmesi (ağır soru havuzu ile kısa soru havuzunu ayırmak için `weight: 'agir' | 'kisa'`).

- [ ] **Günlük set seçimi — `pickDailyFieldTest(department, date)`** (`src/data/questions.ts`):
  - [ ] `pickForDay` ile deterministik: 1 ağır + 2 kısa, aynı gün aynı set.
  - [ ] Günün mülakatıyla çakışmaması için ayrı `salt` (günün mülakatı `salt=3` kullanıyor); üç sorunun da birbirinden farklı çıkması garanti edilecek.
  - [ ] Havuz: seçilen alanın soruları, kurumdan bağımsız.

- [ ] **Yerel havuzun büyütülmesi (taban):** şu an departman başına 5–6 teknik soru var (`yazilim` 6, `arge` 5, `ik` 5) — günlük kullanımda bir haftada tekrara düşer. Yük artık **iki boyutlu** çarpıyor: sektör × departman × soru. İki sektör ve ~13 departmanla 30 soruluk hedef ≈ **780 soru**. Bu çarpan, AI üreticisinin asıl gerekçesi; elle yazmak tek başına gerçekçi değil.
  - [ ] Önce tek bir alanda (savunma / `gömülü yazılım`) ~30 soruluk tam set yazılıp hacim ve kalite ölçülecek; kalan alanlar ona göre planlanacak.
  - [ ] Ölçüm sonucu "elle yazmak sürdürülemez" derse sıra değişir: AI üreticisi **önce** gelir, yerel havuz yalnızca çevrimdışı güvence olarak departman başına az sayıda soruyla kalır.

- [ ] **Soru üreten AI agent (araştırma + uygulama):**
  - [ ] **Determinizm:** üretim rastgele, oysa "aynı gün aynı set" kuralı var. Çözüm yönü: gün başına bir kez üretip yerele yazmak, sonraki açılışlar kayıttan okumak. Üretim başarısızsa yerel havuza düşmek.
  - [ ] **Kota:** BYOK olduğu için üretim kullanıcının kendi kotasından düşer; günde 1 üretim çağrısı + cevap değerlendirmeleri bütçesi hesaplanacak.
  - [ ] **Kalite denetimi:** üretilen soru alana gerçekten ait mi, cevaplanabilir mi, tekrar mı? Üretilen sorular yerele biriktirilip havuzu zamanla besleyebilir (hibrit yol).
  - [ ] **Prompt:** `server/server.ts` / `geminiClient.ts` tarafında "savunma sanayii kıdemli mülakat kurulu üyesi" rolü + alan + seviye + geçmiş sorular (tekrar önleme).

- [ ] **Ekran:** yazılı alan testi ekranı — üç soru sırayla, her birine metin alanı, sette ilerleme göstergesi. `DailyInterviewScreen`'in kamera yolu kullanılmaz; ayrı ekran mı yoksa salt-yazılı mod mu olacağı uygulama sırasında netleşecek.
- [ ] **Ana ekran kartı:** "Günün Alan Testi" — hedef alan etiketi + 3 soruluk set özeti. Günün mülakatı kartından ayrı durur, ikisi de aynı gün yapılabilir.
- [ ] **Geçmiş & karne:** alan testi oturumları `interviewHistory`'de ayırt edilebilsin (`InterviewMode` şu an yalnızca `'camera' | 'typing'`; alan testi hep `typing`, dolayısıyla modu değil **oturum türünü** ayıran bir alan gerekiyor). `ProgressScreen`'de alan bazlı seri ve doğruluk görünsün.
- [ ] **Çevrimdışı:** yerel havuz sayesinde AI kapalıyken de set gösterilir; yalnızca üretim ve değerlendirme atlanır, teknik hata metni gösterilmez (`aiAvailability.ts`).

---

## 4. ⚡ Backend & AI İyileştirmeleri

- [ ] **Express Proxy Server (`server/server.ts`):**
  - [ ] Gemini API prompt'larının savunma sanayii kıdemli mülakat kurulu üyesi rolüne optimize edilmesi.
  - [ ] `express-rate-limit` ve 15 saniyelik zaman aşımı yönetimi.
- [ ] **Çevrimdışı Koruma (Graceful Degradation):**
  - [ ] AI sunucusuna ulaşılamadığında çevrimdışı mülakat soru havuzunun devreye girmesi (`aiAvailability.ts`).

---

## 5. 🎨 UI/UX ve Marka Dönüşümü

- [ ] **Taktiksel Koyu Tema:** Gece laciverdi (`#0f172a`), havacılık zümrütü (`#059669`), çelik mavisi (`#0284c7`).
      ⚠️ Bu palet savunma/havacılık çağrışımıyla seçilmişti. Kapsam "mülakat ve
      iş"e genişlediğine göre tema **sektörsüz** durmalı — aynı renkler kurumsal
      ve ciddi bir ton olarak korunabilir, ama "taktiksel" çerçeve ve askerî
      göndermeler (telemetri dili, hedef/kilitlenme metaforları) arayüzden
      çıkar. Yazılım sektörüne hazırlanan biri de aynı ekranı kendine ait
      görmeli. Renkler `themeTokens.ts`'den gelir, ekrana gömülmez.
- [ ] Mülakat performans kartları ve skor sayaçları (eskiden "telemetri" —
      adlandırma yukarıdaki maddeye göre sadeleşir).

---

## 6. 📦 Production & Store Hazırlığı

- [ ] `app.json`: `name: "İrtifa"`, `package: "com.irtifa.app"`, `bundleIdentifier: "com.irtifa.app"` — Bölüm 0 ile birlikte yapılır.
- [ ] Kamera ve mikrofon izin açıklamalarının mülakat simülasyonuna uyarlanması.
- [ ] `eas.json` Android APK/AAB build yapılandırması.
- [ ] ⚠️ **Gerçek release keystore** — `android/app/build.gradle:115` Terakki'den
      olduğu gibi geliyor ve release varyantını **debug keystore** ile
      imzalıyor (Expo şablonu varsayılanı). Kendi telefonuna kurmak için
      sorun değil; **Play Store bunu kabul etmez.** Yapılacak: kendi keystore'unu
      üret, `signingConfigs.release` tanımla, `release { signingConfig
      signingConfigs.release }` yap.
      ⚠️ **Keystore'u kaybetme.** Play Store'da uygulamanın kimliği o anahtara
      bağlı; kaybedersen o paket adıyla bir daha güncelleme yayınlayamazsın.
      Şifresini ve yedeğini uygulama kodunun dışında sakla, repoya **girmez**.
- [ ] **Derleme akışı** (Terakki'den aynı): geliştirme `npm run android`, APK
      `cd android && ./gradlew assembleRelease`. ⚠️ `app.json` kimliği Bölüm 0'da
      değiştiği için **ilk seferinde `npm run android` yetmez** — mevcut
      `android/` klasörü varken prebuild tekrar çalışmaz (`DEVAM.md` "Ortam
      tuzakları" 4). Sıra: `npx expo prebuild --clean` → `npm run android`.
      Gradle çalıştıran her komutta `JAVA_HOME` açıkça dışa aktarılır (JDK 17
      şart, tuzak 1).
- [ ] Store metni ve ekran görüntüleri: ekseni **mülakat ve iş**; savunma
      sanayii örnek olarak geçer, kapsam olarak geçmez (yazılım sektörüne
      hazırlanan kullanıcı da hedefte).
- [ ] **Gizlilik metni** — yapay zekâ açıkken mülakat metni ve **sesi** doğrudan
      Google'a gidiyor, kullanım kullanıcının kendi kotasından düşüyor (BYOK).
      Terakki'de bu kurulum ekranında yazıyor; store gizlilik bildiriminde de
      yer almalı. Ses kaydı cihazda kalıcı saklandığı için o da beyan edilir.
