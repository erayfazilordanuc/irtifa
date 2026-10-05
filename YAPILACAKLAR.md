# Yol Haritası — İrtifa

Son güncelleme: 2026-10-05

Bu dosya yalnızca **açık işleri** tutar: yapılacaklar, cihazda doğrulanacaklar ve
kullanıcı kararı bekleyen sorular. Kararlar → [KARARLAR.md](KARARLAR.md).
Çalışma kuralları → [CLAUDE.md](CLAUDE.md).

> **Devralınan belgeler.** İrtifa, Terakki'nin kopyasından dönüştürüldü
> (2026-10-04/05). [YAPILACAKLAR_ARSIV.md](YAPILACAKLAR_ARSIV.md) Terakki'nin
> eski yol haritasıdır ve **silinmez**: koddaki `YAPILACAKLAR Bölüm X`
> yorumlarının bir kısmı hâlâ oraya bakıyor. Dönüşüm planının kendisi
> [YAPILACAKLAR_İRTİFA.md](YAPILACAKLAR_İRTİFA.md)'de; aşağıdaki bölüm
> numaraları onunla aynı.

---

## Vizyon

**Mülakat ve iş.** Tek soru: *"bu işe hazır mıyım?"*

| Ayak | Kapsam | Durum |
| --- | --- | --- |
| **Mülakat simülasyonu** | Kurum bazlı canlı mülakat, yapay zekâ analizi, geçmiş | ✅ Çalışıyor (devralındı) |
| **Kriz & pazarlık** | Süre baskılı kriz senaryoları, maaş görüşmesi | ⏳ Kuruldu, cihazda doğrulanacak |
| **Günün alan testi** | Hedef alana göre günlük 1 ağır + 2 kısa yazılı soru | ⏳ Kuruldu, havuz büyütülecek (Bölüm 3) |
| **Kariyer yönetimi** | Başvuru takibi, STAR, şirket notları, mülakat sonrası takip | ⏳ Kuruldu, cihazda doğrulanacak |
| **Atölye** | Mülakata hizmet eden nefes, diksiyon, zihin egzersizleri | ✅ Çalışıyor (budandı) |
| **Karne** | Mülakat puanı, alan testi doğruluğu, seriler, ölçümler | ⏳ Alan testi metrikleri eklendi |

### Ortak ilkeler

Her yeni modül bunlara uyar — istisna yok:

1. **Kapatılabilir.** Modül ayarlarından kapatılan modül ne kart gösterir ne bildirim kurar.
2. **Günlük bir işi var.** "Bugün ne yapmalıyım" sorusunun tek satırlık cevabı olmalı.
3. **Ölçülebilir.** Serisi, skoru ya da süresi tutulur; yoksa modül değil, içeriktir.
4. **Abartmaz.** Ölçtüğü neyse onu yazar; karşılığı olmayan vaat verilmez.
5. **Yeni durum `createPersistentStore` / `createCollectionStore` deseniyle** eklenir; ikinci bir state kütüphanesi eklenmez.
6. **Sektörsüz.** Hiçbir sektör koda gömülmez; arayüzde askerî metafor kullanılmaz.

---

## Sıra

0. ⚠️ **Cihazda doğrulama turu** — en önemli açık iş. Dönüşümün tamamı yalnızca
   `tsc` ile doğrulandı, telefonda hiç görülmedi. Ayrıntı: aşağıdaki "Cihazda
   doğrulanacaklar".
1. **Savunma soru havuzu** (Bölüm 3) — ağırlık/anahtar nokta alanları ve
   departman başına hedef sayı. Yazılım havuzu hazır (81 soru), savunma havuzu
   eksik.
2. **Yerel havuzun büyütülmesi ve AI üreticisi kararı** (Bölüm 3) — pilot alan
   ölçülüp sıra belirlenecek.
3. **Gerçek release keystore** (Bölüm 6) — Play Store'a çıkmadan önce şart.
4. **Haber arşivi yazılım sektörü için** (Bölüm 00) — bugün yalnızca savunma
   girdileri var; yazılım sektöründe yıl sekmeleri boş.
5. **Kriz Masası'nın kendi değerlendirmesi** (Bölüm 2) — bugün mülakat şemasıyla
   puanlanıyor; kriz için "sıralama doğru muydu" ölçütü ayrı yazılmalı.

---

## 00. Sektör kataloğu — ✅ yapıldı (2026-10-05)

**İlke:** *sistemi uygulama versin, alanı katalog versin.* Kullanıcı sektör ya da
kurum yazmaz, **seçer**.

Yapılanlar:

- [x] `src/data/sectors.ts` — sektör, departman, mülakatçı rolü ve haber kaynağı
      kayıtları. `SECTORS`: savunma sanayii + yazılım & teknoloji.
- [x] `CompanyId` birleşim tipinden **serbest kimliğe** döndü; her kurum bir
      sektöre bağlı (`companiesForSector`). Yazılım tarafına altı kurum eklendi.
- [x] `DEPARTMENTS` sektörün altına taşındı: savunmada 10, yazılımda 9 alan.
- [x] Soru havuzu `src/data/questionBank/` altına bölündü (genel · savunma ·
      yazılım · kriz · maaş); `questions.ts` yalnızca tip ve seçim kuralları.
- [x] `defenseNews.ts` → `news.ts`; kaynaklar ve arşiv kayıtları sektör etiketli.
- [x] Yapay zekâ istemleri katalogdan üretiliyor (`interviewerRole`), sabit
      "savunma sanayii" cümlesi kalktı.
- [x] Sektör + hedef alan seçimi oryantasyona adım olarak eklendi ve Profil'den
      değiştirilebiliyor; `Profile.sectorId` + `targetDepartment`.

Kalan:

- [ ] **Haber arşivi yazılım sektörü için boş.** `news.ts` → `ARCHIVE_ENTRIES`
      yalnızca savunma girdileri taşıyor; yazılım seçiliyken yıl sekmeleri boş
      görünüyor. Ya yazılım girdileri yazılmalı ya da sektörün arşivi yoksa
      sekme gizlenmeli.
- [ ] Katalog büyüdükçe `pickDailyTechnical`'daki kurum `salt` hesabı yeniden
      gözden geçirilmeli (`pickForDay` salt'ı `salt * 7` uyguluyor).

---

## 0. Kimlik ayrımı — ✅ yapıldı (2026-10-04)

- [x] `app.json`: `name: "İrtifa"`, `slug: "irtifa"`, `com.irtifa.app` (iOS + Android).
- [x] Depo klasörleri: `STORE_DIR = 'irtifa-store'`, `DB_NAME = 'irtifa.db'`, `AUDIO_DIR = 'irtifa-audio'`.
- [x] Bildirim kimlik ön ekleri `terakki.*` → `irtifa.*`.
- [x] Marka: yeni işaret (yükselen İ), lacivert + zümrüt palet, ikonlar
      `build_from_brand.py` ile üretildi. Terakki'nin işareti `assets/brand/arsiv/terakki/`.
- [x] Belgeler: `CLAUDE.md`, `README.md`, `assets/brand/README.md`, `tools/icon-forge/README.md`.

- [x] **`npx expo prebuild --clean`** çalıştırıldı; native projeler yeniden
      üretildi ve `app.json`'dan geldikleri için artık depoda tutulmuyor.
      Android debug derlemesi geçti (`assembleDebug` → `app-debug.apk`).
- [x] **Ad tuzağı:** ASCII dışı `expo.name` Android paket adını bozuyordu
      (`Unresolved reference 'BuildConfig'`). `expo.name` ASCII'ye çekildi,
      görünen ad `plugins/withDisplayName.js` + `ios.infoPlist` ile veriliyor.
      Ayrıntı `DEVAM.md` → "Ortam tuzakları" 6.

---

## 1. Temizlik ve budama — ✅ yapıldı (2026-10-04)

Mülakatla ilgisi olmayan içerik söküldü: lugat, belagat, günün edebi metni, dinî
içerik (Risale vecizeleri, günün duası) ve genel yaşam hatırlatıcıları (su içme,
göz molası, ayağa kalk, şükür notu). Göz sağlığı egzersizleri de kalktı.

Korunanlar ve gerekçeleri:

- `spacedRepetition.ts` — teknik soru bankasında aralıklı tekrar için.
- `exercises.ts`, `dictionDrills.ts` — Atölye'nin dayanağı; kategoriler mülakat
  çerçevesine çevrildi (ör. "Ön Lob (Frontal)" → "Karar & Kriz Çözümü").
- Yanıt Defteri — beş sekmeden üçe indi: Tümü · Egzersiz · Mülakat.

Yeni hatırlatıcı şablonları: mülakat nefesi, kamera önü duruş, dolgu kelime
kontrolü, STAR tekrarı, teknik terim tekrarı, şirket araştırması.

---

## 2. Gezinme — ✅ yapıldı (2026-10-05)

Beş sekme: **Mülakat · Kriz · Atölye · Kariyer · Karne**. Profil ve Ayarlar
Karne başlığındaki düğmeden açılıyor (profil günlük bir iş değil).

- [x] `InterviewHubScreen` — giriş ekranı; günün iki işi (mülakat + alan testi),
      bitenler ✓ rozetli.
- [x] `CrisisScreen` — kriz senaryoları (10 sn düşünme / 90 sn cevap) ve maaş
      görüşmesi; ikisi de `DailyInterview` motorunu süre parametreleriyle
      kullanıyor.
- [x] `WorkshopScreen` — mülakat nefesi / diksiyonu / zekâsı + hazırlık; günlük
      pratik listesi ve hatırlatıcı sayaçları buraya taşındı.
- [x] Eski `TodayScreen`, `GrowthScreen`, `InterviewScreen` silindi.

Kalan:

- [ ] **Kriz Masası'nın kendi değerlendirmesi.** Bugün mülakat analizi şemasıyla
      puanlanıyor (akıcılık, duruş, derinlik). Kriz sorusunun ölçütü farklı:
      "önce neyi durdurdu, kime haber verdi, neyi feda etti". Ayrı şema gerekiyor.
- [ ] Maaş görüşmesinde yapay zekânın **pazarlık karşı tarafı** olarak cevap
      vermesi (bugün tek soru + tek cevap; karşı teklif turu yok).

---

## 2.5. İş hayatı & kariyer yönetimi — ⏳ kuruldu (2026-10-05)

- [x] **Başvuru takibi** (`applications.ts`, `ApplicationsScreen`) — şirket,
      pozisyon, aşama, not; aşama değişiklikleri geçmişe yazılıyor. SQLite
      `applications` tablosu (şema v4). Kanban yerine aşamaya göre gruplanmış
      dikey liste seçildi: telefonda yatay kanban okunmuyor.
- [x] **STAR cevap kurucu** (`starStories.ts`, `StarStoriesScreen`) — dört adım
      ayrı alanlarda, hazır başlık önerileri, panoya kopyalama. SQLite
      `star_stories` tablosu.
- [x] **Şirket araştırma notları** (`companyNotes.ts`, `CompanyNotesScreen`) —
      kurum başına tek metin, hazır araştırma soruları. `kv` yolu yeterli.
- [x] **Maaş görüşmesi** — Kriz Masası'nda ayrı mod, kendi soru havuzu (`maas.ts`).
- [x] **Mülakat sonrası takip** (`FollowUpScreen`) — teşekkür mesajı şablonu
      (panoya kopyalanıyor) ve öz-değerlendirme; başvuru kaydına yazılıyor.

Kalan:

- [ ] **Teknik soru bankası ekranı** — havuz hazır (`technicalPool`), aralıklı
      tekrar deseni (`spacedRepetition.ts`) devralındı, ama bankayı serbestçe
      çalışacak bir ekran yok. Bugün havuza yalnızca günün alan testi ve
      mülakat üzerinden erişiliyor.
- [ ] Şirket notunun **simülasyon başlarken hatırlatılması** — not yazılıyor ama
      o kurumla mülakat başlatılırken gösterilmiyor.
- [ ] Başvuru kaydından doğrudan "bu kurumla mülakat başlat" kısayolu.

---

## 3. Günün alan testi — ⏳ kuruldu (2026-10-05)

Hedef alana göre her gün **1 ağır + 2 kısa** soru, yalnızca yazılı
(kararlar: `YAPILACAKLAR_İRTİFA.md` Bölüm 3).

- [x] `pickDailyFieldTest(department, date)` — deterministik set; ağır soru her
      zaman bir tane, üç soru birbirinden farklı, günün teknik sorusundan ayrı
      kaydırma.
- [x] `Question` tipine `weight` ('agir' | 'kisa') ve `keyPoints` eklendi.
- [x] `FieldTestScreen` — üç soru, metin alanları, ilerleme göstergesi. Kamera
      ve mikrofon yolu hiç kullanılmıyor.
- [x] Yapay zekâ açıkken üç cevap birlikte puanlanıyor (0-100 + gerekçe + set
      özeti); kapalıyken `keyPoints` açılıp kullanıcı kendisi işaretliyor
      (KARARLAR "otomatik kontrol ile öz-değerlendirmenin ayrımı").
- [x] Geçmiş: aynı depoda `kind: 'fieldTest'` ile ayrışıyor
      (`interviewHistory.ts`); Karne'de alan testi ortalaması, set sayısı,
      çalışılan alan sayısı ve eğride ayrı seri.
- [x] Mülakat sekmesinde "Günün alan testi" kartı; alan seçilmemişse Profil'e
      götürüyor.

Kalan:

- [ ] **Savunma soru havuzu eksik.** Yazılım tarafı dokuz departmanda 81 soru
      (3 ağır + 6 kısa); savunma tarafında devralınan 16 soru var ve hiçbirinde
      `weight`/`keyPoints` yok. Hedef: `sv-gomulu` ≥30 (pilot), diğer dokuz alan
      ≥8.
- [ ] **Yerel havuzun büyütülmesi ölçülecek.** İki sektör × ~19 departman × 30
      soru ≈ 1100 soru. Pilot alan yazıldıktan sonra "elle sürdürülebilir mi"
      kararı verilecek; sürdürülemezse AI üreticisi öne alınır ve yerel havuz
      yalnızca çevrimdışı güvence olarak kalır.
- [ ] **Soru üreten AI agent (araştırma).** Çözülecekler: determinizm (gün başına
      bir üretim, yerele yazma, başarısızsa havuza düşme), kota (BYOK —
      kullanıcının kendi kotası), kalite denetimi (alana ait mi, tekrar mı),
      istem (rol + alan + seviye + geçmiş sorular).
- [ ] Alan testi **serisi** (streak) tutulmuyor; Karne'de "kaç gün üst üste"
      görünmüyor.
- [ ] Alan testi geçmişi Mülakat Geçmişi ekranında **ayrı gösterilmiyor**: kayıt
      düşüyor ama üç sorulu set detayı (cevaplar + puanlar) açılmıyor.

---

## 4. Yapay zekâ

- [x] İstemler sektör kataloğundan üretiliyor; askerî dil ("savunma refleksi",
      "askeri disiplinli") arayüzden ve şemadan çıkarıldı.
- [x] `server/server.ts`: IP başına hız sınırı (varsayılan 60 sn / 20 istek) ve
      15 sn zaman aşımı eklendi; ses MIME türü `audio/mp4`.
- [ ] ⚠️ **Sesli mülakat analizi hiç denenmedi** (MIME değişikliği Terakki'den
      devralındı). İrtifa'nın can damarı; ilk build'de önce bu sınanmalı.
- [ ] Çevrimdışı koruma: anahtar yokken alan testi ve mülakat çalışıyor, ama
      "yapay zekâ kapalı" durumunun her ekranda aynı dille anlatıldığı bir tur
      atılmadı.

---

## 5. Tema ve marka — ✅ yapıldı (2026-10-05)

- [x] Marka renkleri tek kaynakta: `themeTokens.ts` → `BRAND` (lacivert
      `#0F172A` + zümrüt `#10B981`). İkon, native splash, `SplashOverlay` ve
      oryantasyon degradesi aynı değerleri okuyor.
- [x] Sekme zeminleri beş sekmeye göre yeniden dağıtıldı (`ScreenBackground`).
- [x] "Taktiksel" çerçeve ve askerî metaforlar çıkarıldı; palet sektörsüz.

Kalan:

- [ ] Koyu tema yüzeyleri nötr gri kalmaya devam ediyor (Terakki kararı). Marka
      laciverdi yalnızca ikon/splash'ta; uygulama içinde lacivert yüzey yok.
      Bilinçli: KARARLAR "Koyu tema nötr olacak". Değiştirilecekse karar yazılmalı.

---

## 6. Production & store hazırlığı

- [x] `app.json` kimliği ve izin açıklamaları mülakat simülasyonuna uyarlandı
      (kamera metninde duruş analizi için karelerin Google'a gittiği yazıyor).
- [ ] ⚠️ **Gerçek release keystore** — `android/app/build.gradle:115` release
      varyantını **debug keystore** ile imzalıyor (Expo şablonu varsayılanı).
      Play Store kabul etmez. Kendi keystore'unu üret, `signingConfigs.release`
      tanımla. ⚠️ **Keystore'u kaybetme**: Play Store'da uygulamanın kimliği o
      anahtara bağlı. Şifresi ve yedeği repo dışında saklanır.
- [ ] `eas.json` Android APK/AAB yapılandırması.
- [ ] Store metni ve ekran görüntüleri — ekseni **mülakat ve iş**; savunma
      sanayii örnek olarak geçer, kapsam olarak değil.
- [ ] **Gizlilik metni** — BYOK ile mülakat metni, sesi ve duruş kareleri
      doğrudan Google'a gidiyor; ses kaydı cihazda kalıcı saklanıyor. İkisi de
      store bildiriminde yer almalı.

---

## Cihazda doğrulanacaklar

⚠️ **Dönüşümün tamamı yalnızca `tsc` ile doğrulandı; hiçbiri telefonda
görülmedi.** Terakki'den devralınan doğrulanmamış işler de aşağıda duruyor —
bulunan hata büyük olasılıkla Terakki'de de var, oraya da bildirilmeli.

**İlk build — sıra bu**

- [ ] Uygulama telefonda **açılıyor mu** (native modüller linklendi mi: sqlite,
      secure-store, clipboard, system-ui). Derleme geçti, açılış denenmedi.
- [ ] Yeni kimlik: ana ekranda "İrtifa" adı ve yeni ikon; Terakki'nin yanına
      ayrı uygulama olarak kuruluyor mu (`com.irtifa.app`).
- [ ] Açılış ekranı: native düz lacivert → degradeli katman geçişinde renk
      sıçraması var mı; "İrtifa" yazısı tam görünüyor mu.
- [ ] **Sesli mülakat analizi uçtan uca** — `audio/mp4` değişikliği hiç
      denenmedi. En kritik madde.
- [ ] **SQLite şema v4 göçü** — `applications` ve `star_stories` tabloları
      yaratılıyor mu; göç başarısız olursa `kv` yoluna düşüp çalışıyor mu.
- [ ] BYOK: anahtar kaydediliyor, uygulama kapanıp açılınca duruyor, geçersiz
      anahtar kaydedilmeden reddediliyor mu.

**Yeni ekranlar (2026-10-05)**

- [ ] Günün alan testi: alan seçiliyken üç soru geliyor mu; aynı gün ikinci
      açılışta **aynı set** mi; yapay zekâ açıkken puan ve gerekçe, kapalıyken
      beklenen noktalar + öz-işaretleme çalışıyor mu; kayıt Karne'ye düşüyor mu.
- [ ] Alan seçilmemişken: Mülakat sekmesindeki kart ve alan testi ekranı
      Profil'e yönlendiriyor mu.
- [ ] Havuzu boş bir departman seçilince "havuz hazırlanıyor" ekranı çıkıyor,
      çökmüyor mu (savunma alanlarının çoğunda soru yok).
- [ ] Kriz Masası: 10 sn düşünme / 90 sn cevap sayaçları doğru mu; kurumsuz
      modda başlık "Kriz Masası" görünüyor mu (eskiden kurum adı zorunluydu).
- [ ] Maaş görüşmesi: 20/120 sn; kayıt geçmişe "Maaş Görüşmesi" adıyla düşüyor mu.
- [ ] Başvuru takibi: ekleme, aşama değiştirme (geçmişe satır düşüyor mu),
      katalogdan kurum bağlama, silme.
- [ ] STAR: hikâye kaydetme, dört adım sayacı, panoya kopyalama.
- [ ] Şirket notları: not yazma, boşaltınca kaydın silinmesi, sektör değişince
      listenin değişmesi.
- [ ] Mülakat sonrası takip: başvuru seçimi, şablonun kopyalanması,
      öz-değerlendirmenin kayda yazılması.
- [ ] Oryantasyon: yeni sektör/alan adımı (7 adım); sektör seçmeden geçilebiliyor
      mu; seçilen alan Profil'de görünüyor mu.
- [ ] Sektör değiştirince: kurum listeleri, haber akışı ve hedef alan çipleri
      güncelleniyor mu; sektöre ait olmayan hedef alan temizleniyor mu.
- [ ] Beş sekmeli alt çubuk: dar ekranda etiketler taşmıyor mu; her sekmenin
      degrade zemini doğru mu; son kart çubuğun altında kalmıyor mu.
- [ ] Karne → Profil düğmesi; Profil'den geri dönüş.

**Terakki'den devralınan, hâlâ doğrulanmamış**

- [ ] Mülakat ses kaydı: yarıda çıkışta "Kaydet ve çık"; kaydın Mülakat
      Geçmişi'nden dinlenebilmesi; "Kaydetmeden çık"ta mikrofonun serbest kalması.
- [ ] Mülakattan geri tuşu/jestiyle çıkışta uyarı geliyor mu.
- [ ] Yanıt Defteri (üç sekme), egzersizde yazı girişi + otomatik kontrol.
- [ ] Alttan açılan paneller: açılışta süpürme yok, kapanışta panel kayıp örtü
      soluyor mu.
- [ ] Ayarlar'daki anahtarlar (özellikle Android'de takılma).
- [ ] Bildirim yönlendirmesi: `data.screen` → `DiaphragmExercise`,
      `SpeechExercise`, `BrainExercises`, `NewsScreen`.
- [ ] Günlük süre: 3 dk seçince Atölye'deki liste kısalıyor, "Daha fazlası"
      hepsini açıyor mu.
- [ ] Türkçe büyük harf: ekranlarda noktasız I çıkan yer kaldı mı (`trUpper`).

---

## Açık sorular

- **Haber arşivi yazılım sektörü için yazılacak mı,** yoksa arşivi olmayan
  sektörde yıl sekmeleri gizlenecek mi?
- **Soru üretimi AI'a devredilecek mi?** Kardeş uygulama Fesahat'ın aynı sorusu
  var; iki uygulama için iki kez çözülmemeli (KARARLAR 2026-10-04).
- **Teknik soru bankası ayrı bir ekran mı olacak,** yoksa alan testinin
  "daha fazla soru" uzantısı olarak mı kalacak?
