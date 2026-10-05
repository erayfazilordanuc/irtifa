# Yol Haritası — Arşiv (2026-09-19)

> `YAPILACAKLAR.md` 2026-09-19'da temizlenmeden önceki hâlinin **birebir kopyası**.
> Tamamlanan işlerin ayrıntısı, gerekçesi ve sınama notları burada. Bölüm
> numaraları aynı; koddaki `YAPILACAKLAR Bölüm X` yorumları için bu dosyaya bak.
> Güncel plan ve açık işler: [YAPILACAKLAR.md](YAPILACAKLAR.md).

---


Son güncelleme: 2026-09-09

Bu dosya uygulamanın **nereye gittiğini** anlatır: eklenecek özellikler, hangi sırayla
geleceği ve her birinin ne vaat edip ne vaat etmediği. Kod değil, karar defteri.

---

## Vizyon

Uygulama bir mülakat simülatörü olarak başladı. Hedef, onu **kişisel gelişim
uygulamasına** dönüştürmek — kariyerden diksiyona, nefesten zihne kadar tek çatı altında.

Tek soru etrafında kuruluyor: **"bugün kendini nerede geliştirdin?"**

### Sütunlar

| Sütun | Kapsam | Durum |
| --- | --- | --- |
| **Kariyer & Mülakat** | Simülasyon, yapay zekâ analizi, geçmiş, sektör haberleri | ✅ Var → Bölüm 3 ile genişleyecek |
| **Konuşma & Diksiyon** | Artikülasyon, tekerleme, vurgu-tonlama, tempo, dolgu kelime avı | ✅ Var → Bölüm 6 |
| **Dil & İfade** | Lugat & Türkçe: kelime hazinesi, doğru kullanım, deyimler; ileri düzeyde belagat (meânî / beyân / bedî') | ✅ Yeni ekran (2026-09-11, kod) → genişleme Bölüm 7 |
| **Dinlenme & Denge** | Diyafram programları, nefes kontrolü, 20-20-20 göz dinlendirme | ✅ Var |
| **Zihin & Odak** | Bilişsel lob haritası, mantık, hafıza, mekan egzersizleri | ✅ Var |
| **Alışkanlık & Rutin** | Aralıklı hatırlatıcılar, serbest alarmlar, günlük sayaçlar | ⏳ İlk ekran: günlük pratik hatırlatmaları (2026-09-11) → Bölüm 4 |
| **Ölçüm & Karne** | Kişisel testler, ilerleme geçmişi, seviye tespiti | ⚠️ İlerleme sekmesinde kısmen var; Gelişim kartı oraya açılıyor → Bölüm 5 |

### Ortak ilkeler

Her yeni modül bunlara uyacak — istisna yok:

1. **Kapatılabilir.** Modül ayarlarından (ekranın sağ üstündeki çark) kapatılan modül ne kart gösterir ne bildirim kurar.
2. **Günlük bir işi var.** "Bugün ne yapmalıyım" sorusunun tek satırlık cevabı olmalı.
3. **Ölçülebilir.** Serisi, skoru ya da süresi tutulur; yoksa modül değil, içeriktir.
4. **Abartmaz.** Ölçtüğü neyse onu yazar. "Kapasiteni artırır", "zekânı yükseltir" gibi
   karşılığı olmayan cümleler kurulmaz — bu kural bölüm bölüm aşağıda uygulanmış durumda.

### Sıra

00. ✅ **Genele açılma & AI Esnekliği** (Bölüm 00) — Yapay zekâsız %100 çalışma, kırılganlık korumaları.
0. ✅ **Gezinme mimarisi** (Bölüm 0) — Dört sekme (Bugün, Gelişim, İlerleme, Profil).
0.1 ✅ **Uygulamaya Isındırma & Oryantasyon Modülü** (Bölüm 0.1; kod 2026-09-11, cihazda doğrulanacak; konumlu ipucu balonları sonraki sürüm) — Duolingo tarzı ilk açılış ve mikro-pratik akışı.
0.2 ✅ **İlerleme & Profil Sekmeleri UI/UX İyileştirmeleri** (Bölüm 0.2) — Seriler 2 satırlı (2x2) ızgaraya, geçmişler tek satırda yan yana butonlara dönüştürüldü; ekran büzülerek alttaki geçmişlerin kaydırmaya gerek kalmadan tek bakışta görünmesi sağlandı. Profil hedefleri ve rozet vitrini tamamlandı.
0.3 ⏳ **Modül Ayarlarının Modül İçlerine Taşınması** (Bölüm 0.3) — Ayarlar ekranı genel tercihlere indirgendi; modül içi ayar kontrolleri ilgili ekranlara taşındı. **2026-09-11:** taşıma sırasında modül aç/kapa, günlük hatırlatma ve saat kontrollerinin hiçbir ekranda kalmadığı görüldü; her modül ekranına sağ üstte çark + ayar paneli ve bir Hatırlatıcılar ekranı eklendi (kod tamam, `tsc` temiz; cihazda doğrulanacak).
0.4 ⏳ **SQLite Veritabanı Geçişi & Katalog Mimarisi** (Bölüm 0.4; üç aşama — aşama 1 kodu tamam 2026-09-11, cihazda doğrulanacak; aşama 2 — geçmiş tabloları — kodu tamam; ikisi de cihazda doğrulanacak; aşama 3 içerik büyümesine bağlı) — `expo-sqlite` ile offline soru, tekerleme, metin kataloğu ve geçmiş veri yönetimi.
0.5 **Oyunlaştırma & Liderlik Tablosu (Gamification & Leaderboard)** (İleride Değerlendirilecek) —
   * ⚠️ **Mimarî ve Felsefî Uyarı:** Uygulama öz-farkındalık ve çevrimdışı (offline-first) ilkelerine dayanır. Global rekabet tabloları; (1) Sunucu ve kimlik doğrulama bağımlılığı getirir, (2) Nefes ve okuma hızı gibi öz-ölçümlerde hileye ve sahte skor yarışına yol açıp pratiğin amacını bozabilir. Küresel sıralama yerine **Kişisel Rekorlar (Öz-Rekabet)** veya yerel kıyaslamalar tercih edilmelidir.
1. ✅ **Kimlik: logo ve ikonlar** (Bölüm 8) — Uygulama ikonları `assets/brand/ikon/` kaynağından `tools/icon-forge/build_from_brand.py` ile türetiliyor (2026-09-11).
2. ✅ **Ölçüm & Karne** (Bölüm 5) — 6 yeni test + kelime seviye tespiti + İlerleme'deki KARNE bölümü (kod 2026-09-12, cihazda doğrulanacak). Zayıf ses tespiti ve bilişsel başlangıç ertelendi.
3. ⏳ **Alışkanlık & Rutin** (Bölüm 4) — 4a aralıklı hatırlatıcılar ve 4b serbest alarmlar 2026-09-13'te bitti (kod tamam, `tsc` temiz, saf modüller Node altında sınandı; **cihazda doğrulanacak**). Bildirim bütçesi aşımı da bu turda kapandı.
4. ⏳ **Kişisel içerik — dinî mod** (Bölüm 9) — günün Risale-i Nur vecizesi 2026-09-13'te eklendi (kod; cihazda doğrulanacak). Metin doğrulaması ve Gmail'den çekme açık.
5. **Kariyer, Diksiyon, Dil & İfade (lugat) genişlemeleri** (Bölüm 3, 6, 7) — **sıradaki iş**.

> 2026-09-18'de araya arayüz işleri girdi (hepsi kendi bölümünde yazılı):
> splash yazısı görsele çevrildi, İlerleme ekranı yeniden kuruldu, sadeleştirme
> turu yapıldı, Türkçe büyük harf hatası kapandı.

---

## 00. Genele açılma — uygulamanın en temel dönüşümü

**Hedef:** Uygulamayı yalnızca yazarının değil, herkesin kullanabileceği hâle
getirmek — genele hitap eden bir yüz, isteyene açılan bir derinlik.

**İlke:** *sistemi uygulama versin, alanı katalog versin.* Motor (günlük pratik,
ölçüm, seri, bildirim, egzersiz altyapısı) zaten alan-bağımsız; sorun içeriğin
koda gömülü olması. Alan koddan çıkar ama **kullanıcıya değil hazır kataloğa**
gider — kullanıcı yazmaz, seçer. Gerekçe [KARARLAR.md](KARARLAR.md)'de.

### Bugün nerede takılıyor

| Bulgu | Yer |
| --- | --- |
| Uygulama hiçbir sunucuyla gelmiyor | `appSettings.ts` → `DEFAULT_API_BASE_URL = ''` |
| Kurumlar bir **tip** olarak sabit | `companies.ts` → `CompanyId = 'aselsan' \| 'roketsan' \| ...` |
| Bölümler üçle sınırlı | `questions.ts` → `DEPARTMENTS` (yazilim, arge, ik) |
| Haber akışı sektöre kilitli | `defenseNews.ts` |
| İlk açılış akışı hiç yok | — |

Sonuç: uygulama açılışta kullanıcının savunma sanayii adayı olduğunu
**varsayıyor**.

### Aşamalar

**1 · Yapay zekâyı kurulumsuz ve kırılgan olmayan hâle getir**

İki çıktısı vardı; **ikincisi yapıldı (2026-09-08)**, birincisi kararı bekliyor.

*a) Yapay zekâsız da tam çalışma* — ✅ **yapıldı**

Yeni `src/utils/aiAvailability.ts` tek kaynak: `aiAvailable()` / `useAiAvailable()`
ve ortak `AI_UNAVAILABLE_HINT` metni. Yapay zekâ isteyen her yer artık çağrıyı
yapıp hatayı yakalamak yerine önce buraya soruyor.

- `AnalysisScreen` kapalıyken çağrıyı hiç denemiyor; "Değerlendirme kapalı"
  diyen nötr bir durum gösteriyor. Eskiden kullanıcı şunu görüyordu:
  *"Sunucu adresi tanımlı değil. Ayarlar → Backend API Adresi alanını
  doldurun."* — son kullanıcıya söylenecek bir cümle değil, üstelik uygulamayı
  yeni kuran **herkes** bunu görüyordu.
- `AiInsightCard` (iki geçmiş ekranının paylaştığı kart) düğmeyi baştan kapalı
  gösteriyor, nedenini sade dille yazıyor. Kart gizlenmiyor ki özelliğin
  varlığı bilinsin.
- Doğrulandı: mülakat kaydı `addSession` ile **analizden önce** diske yazılıyor,
  yani yapay zekâ hiç çalışmasa da kayıt kaybolmuyor; `RecordedSession.analysis`
  zaten isteğe bağlı ve geçmiş ekranı "Analiz yok" rozetiyle çiziyor.

*b) Kurulumsuz çalışma* — ⏳ kararı verildi, yolu doğrulanmadı. Ücretsiz kota ve
sunucusuz barındırma sınırları ölçülecek (ayrıntı KARARLAR'da).

**2 · Alanı kataloğa taşı**

- `CompanyId` birleşim tipi → serbest kimlik + hazır katalog. Savunma sanayii
  kataloğun bir girdisi olur, tipin tamamı değil.
- `DEPARTMENTS` aynı şekilde genişler.
- Haber akışı sektör parametreli olur.
- Kullanıcı hiçbir şey **yazmaz**; ilk açılışta seçer.
- ⚠️ Alan varsayımı yalnızca veri dosyalarında değil, **yapay zekâ istemlerinde**
  de var: `AnalysisScreen` prompt'u "Sen Türk savunma sanayii firmalarında görev
  yapmış kıdemli bir mülakat kurulu üyesisin" diye başlıyor. Katalog seçimine
  göre üretilmeli.

**3 · İlk açılış**

Üç adım, hepsi tek dokunuşluk: neyi geliştirmek istiyorsun (sütunlar) → hangi
alan (katalog) → hatırlatma saati. Yeni state deseni açılmaz, mevcut store'lara
yazar. Uygulamayı "yazarının uygulaması" olmaktan çıkaran asıl adım budur.

**4 · Gezinme** — Bölüm 0'daki dört sekme.

**5 · Modül derinliği** — her sütunun sade bir yüzü, bir de "daha ileri" yüzü.

### Sıra neden böyle

Sekmeleri (Bölüm 0) yeniden dizip içine yine savunma sanayii varsayımı koymak
işi iki kez yapmak olur; o yüzden alan katmanı gezinmeden önce geliyor. Yapay
zekâ da en başta, çünkü "yapay zekâsız da çalışır" kuralı diğer üç aşamanın
tasarımını etkiliyor.

### Derinlik kaybolmuyor

Yedi sütun bağımsız açılıp kapanıyor. Sadece nefes + okuma açan tutarlı ve
küçük bir uygulama görür; hepsini açan bugünkü derinliği görür. "Genele hitap"
varsayılandan, "içi dolu" talepten geliyor — ikisi çelişmiyor.

---

## 0. Gezinme mimarisi

**Karar tarihi:** 2026-09-08. Kararlar verildi, uygulanıyor.

### Neyi düzeltiyoruz

| Sorun | Bugünkü hâli |
| --- | --- |
| Giriş ekranı mülakat | `SimulationScreen`'in **en büyük öğesi** "Günlük Mülakata Başla"; asıl günlük pratik listesi en altta |
| Mülakat sistemin dışında | Dört günlük pratik modülü var (`dailyText`, `diaphragm`, `speech`, `belagat`); mülakat bunlardan biri değil, ayrıcalıklı duruyor |
| Tek sütun sekme kapmış | "Egzersizler" sekmesi yalnızca Zihin & Zekâ'yı gösteriyor; konuşma, belagat, nefes, alışkanlık, ölçüm alt ekranlarda gizli |
| Ölçüm dili mülakat merkezli | Profilde iki istatistik kutusu (Mülakat, Egzersiz) ve grafikte iki seri; metin, nefes, konuşma, belagat hiç görünmüyor |
| Ekran iki iş yapıyor | `SimulationScreen` = günün duası + üç mülakat girişi + günlük pratik listesi |

### Sekmeler

```
┌────────┬─────────┬──────────┬────────┐
│ Bugün  │ Gelişim │ İlerleme │ Profil │
└────────┴─────────┴──────────┴────────┘
```

| Sekme | İşi | Nereden geliyor |
| --- | --- | --- |
| **Bugün** | "Bugün ne yapmalıyım" sorusunun tek ekranlık cevabı: günlük pratik listesi, seri, günün duası (açıksa) | `SimulationScreen`'in pratik yarısı |
| **Gelişim** | Yedi sütunun hub'ı. Her sütun bir kart; mülakat da bunlardan **biri** | Yeni ekran; `BrainExercisesScreen` sekmeden karta iner |
| **İlerleme** | Yedi sütunun tamamının ölçümü: seriler, test eğilimleri, mülakat ve egzersiz geçmişi | `ProfileScreen`'in ölçüm yarısı |
| **Profil** | Yalnızca kimlik ve ayarlar | `ProfileScreen`'in kalanı |

⚠️ **"Gelişim" ile "İlerleme" anlamca yakın.** Adlandırma bilerek seçildi; ayrımı
alt başlık ve ikon taşıyacak. Gelişim = *ne çalışacağım*, İlerleme = *ne kadar
yol aldım*. Alt başlıklar bunu açıkça söylemeli, kullanıcı tahmin etmemeli.

### Mülakatın yeri: yalnızca hub

**Karar:** mülakat günlük pratik modülü **olmayacak**. Bugün listesinde
görünmez; Gelişim sekmesindeki "Kariyer & Mülakat" kartından açılır.

Sonucu: mülakat alışkanlığı kurmak isteyen için günlük hatırlatıcı olmuyor.
Kabul edildi — uygulama artık mülakat uygulaması değil, mülakat bir sütun.

### Gelişim hub'ının içeriği

| Kart | Açtığı yer | Durum |
| --- | --- | --- |
| Kariyer & Mülakat | yeni `InterviewScreen` (günlük mülakat, özelleştirilmiş, sektörel gelişmeler, geçmiş) | `SimulationScreen`'den ayrılacak |
| Konuşma & Diksiyon | `SpeechExerciseScreen` | var |
| Dil & İfade | `LanguageScreen` (lugat & Türkçe); oradan `DailyTextScreen` ve ileri düzey `BelagatExerciseScreen` | ✅ 2026-09-11 (kod) — genişleme Bölüm 7 |
| Nefes & Beden | `DiaphragmExerciseScreen` | var |
| Zihin & Zekâ | `BrainExercisesScreen` | var, sekmeden karta iniyor |
| Alışkanlık & Rutin | `RemindersScreen` | ✅ 2026-09-11 kilit açıldı, ilk sürüm (günlük pratik hatırlatmaları); aralıklı hatırlatıcı ve alarmlar ⏳ Bölüm 4 |
| Ölçüm & Karne | İlerleme sekmesine kısayol | ✅ 2026-09-11 kilit açıldı, İlerleme sekmesini açıyor; derinleştirme Bölüm 5 |

Sektörel gelişmeler (savunma sanayii haberleri) **kalıyor** — Kariyer & Mülakat
sütununun altında.

Kapalı modüller hub'da da görünmez.

### İlerleme sekmesi: yedi sütunun hepsi

Bugünkü iki kutu + iki seri yetersiz. İlerleme, uygulamanın **ölçtüğü her şeyi**
gösterir: modül serileri, test eğilimleri (`TestTrend`), mülakat geçmişi,
egzersiz geçmişi. Mülakat artık ayrıcalıklı bir yer tutmuyor.

### Yapılacaklar

1. ✅ `SimulationScreen` ikiye ayrıldı → `TodayScreen` + `InterviewScreen`, sonra silindi.
2. ✅ `GrowthScreen` (Gelişim hub'ı) yazıldı — yedi sütun, kapalı modüller
   görünmüyor. Alışkanlık & Rutin ile Ölçüm & Karne başta kilitliydi;
   **2026-09-11'de açıldı** (Hatırlatıcılar ekranı / İlerleme sekmesi).
3. ✅ `ProgressScreen` (İlerleme) yazıldı; seriler + test eğilimleri + kariyer/zihin
   kutuları + gelişim eğrisi + geçmiş girişleri.
4. ✅ `ProfileScreen` kimlik + ayarlara indi.
5. ✅ `App.tsx` sekmeler dörde çıktı; `BrainExercisesScreen` ve yeni
   `InterviewScreen` stack ekranı oldu. Dört sekmenin ortak kalıbı `TabItem`
   bileşenine çıkarıldı.
6. ✅ `BackgroundVariant` güncellendi. Uyarı yerindeydi: tip değişince TypeScript
   iki yeri birden yakaladı (`ScreenBackground` varsayılan bağlamı ve
   `App.tsx`'teki `useState`). Sessiz düşme olmadı.
7. ⏳ Ana sekmenin ikonu artık `Sunrise`; nihai hâli logo kararıyla gelecek (Bölüm 8).

### Cihazda doğrulanmayı bekliyor

Telefon takılı olmadığı için görsel doğrulama yapılamadı. Bakılacaklar:
alt çubuğun dört sekmeyle görünümü, her sekmenin degrade zemini, Gelişim'deki
açılan iki kart (Alışkanlık & Rutin, Ölçüm & Karne), İlerleme'nin boş durumları.

### Dokunulmayacak

Bildirim yönlendirmesi (`data.screen` → `DiaphragmExercise`, `SpeechExercise`,
`BelagatExercise`, `DailyText`) stack ekranlarına gidiyor, sekme yapısına bağlı
değil. Yeniden düzenlemede bozulmaz ama iş bitince bir kez sınanmalı.

---

## 0.1. Uygulamaya Isındırma & Oryantasyon Modülü (Duolingo Tarzı Isındırma Akışı)

**Karar:** Uygulamayı ilk kez açan kullanıcının karmaşık sekme ve egzersiz seçenekleriyle doğrudan baş başa kalmasını engellemek; Duolingo ve benzeri başarılı kişisel gelişim uygulamalarında olduğu gibi, ilk 60 saniyede kullanım amacını netleştirip "ilk zaferini" (First Win & 1 Günlük Seri) elde etmesini sağlamak.

### Neden Gerekli? (Araştırma & Emsaller)

- **Duolingo Akışı**: Kullanıcıyı ilk açılışta uzun kayıtlara ve formlara yönlendirmez. 3 basit mikro-soru sorar (*"Ne öğrenmek istiyorsun?", "Günde kaç dakika?", "Hatırlatıcı saatin?"*), ardından hemen **10-20 saniyelik etkileşimli bir mikro pratik** yaptırır. Kullanıcı ana ekrana geldiğinde ilk gün serisi başlar ve sistemin değerini anlar.
- **Blinkist / Elevate / Headspace**: Kullanıcıyı katalog sayfalarında yalnız bırakmaz. Seçilen 1-2 alana göre dinamik **"Günün Isındırma Paketi"** hazırlar.
- **Bilişsel Yükü Azaltma**: Uygulamamız 7 ayrı sütun (Kariyer, Diksiyon, Belagat, Nefes, Zihin vb.) barındırdığı için, ilk açılışta oryantasyon olmadan giren kullanıcı uygulamayı terk edebilir. Isındırma modülü uygulamayı "anlaşılır ve alışkanlık yapıcı" kılar.

### Modül Akışı & Bileşen Tasarımı

1. **Adım 1: Hedef & İlgi Alanı Seçimi (3 Dokunuşluk Oryantasyon)**
   - **Odak Alanı**: Neyi geliştirmek istiyorsun? (*Kariyer & Mülakat, Diksiyon, Belagat, Nefes & Denge, Odak & Zihin*).
   - **Günlük Taahhüt**: Günde kaç dakika ayırabilirsin? (*3 dk / 5 dk / 10 dk*).
   - **Hatırlatıcı Zamanı**: Günün hangi diliminde pratik yapacaksın? (*Sabah / Öğle / Akşam*).

2. **Adım 2: 60 Saniyelik İlk Isındırma Pratiği (Interactive First Win)**
   - Seçilen alana göre anında interaktif mikro pratik başlatılır:
     - *Diksiyon:* 1 tekerleme kartı veya hızlı artikülasyon testi.
     - *Nefes:* 30 saniyelik 4-6 diyafram nefesi çemberi.
     - *Kariyer:* 1 kriz yönetimi veya STAR tekniği sorusu.
   - Bitişte: Rozet animasyonu ve **"1 Günlük Seri Başladı! 🎉"** kutlaması.

3. **Adım 3: Kişiselleştirilmiş Ana Sayfa (`TodayScreen`) & Mikro İpucu Turu**
   - Kullanıcının oryantasyonda seçtiği sütunlar `TodayScreen`'de üst sıraya alınır.
   - 4 sekme (Bugün, Gelişim, İlerleme, Profil) üzerinde 4 adımlı hafif, rahatsız etmeyen ipucu balonları (contextual tooltips) gösterilir.

### Teknik Yapı & Entegrasyon Planı

- **Store & State**: `dailyPracticeSettings` içinde `onboardingCompleted: boolean`, `userGoals: string[]`, `dailyTargetMinutes: number`.
- **Ekran / Akış**: `src/screens/OnboardingScreen.tsx` modal veya stack ekranı.
- **Giriş Kontrolü**: `App.tsx` yüklenirken `onboardingCompleted === false` ise ana sekmeler öncesi `OnboardingScreen` tetiklenir.

### Uygulama kararları (2026-09-11)

Spec'ten sapılan yerler ve gerekçeleri [KARARLAR.md](KARARLAR.md) → "İlk açılış oryantasyonu".

- **Depo:** `src/utils/onboarding.ts` (ayrı `onboarding` deposu) — `completed`, `goals` (seçim sırası = öncelik), `dailyMinutes` (3/5/10), `reminderSlot` (sabah/öğle/akşam/yok), `tourDismissed`. Spec'teki `dailyPracticeSettings` alanları yerine.
- **Hedefler:** Kelime & Türkçe · Konuşma & Diksiyon · Nefes & Denge · Zihin & Odak · Kariyer & Mülakat. Hedef modülleri **kapatmaz**, yalnızca Bugün listesinde ve Gelişim'de öne alır.
- **Mevcut kullanıcı** (seri, kelime, geçmiş ya da profil adı olan) oryantasyonu görmez; karar ilk açılışta kaydedilir.
- **Isınma seriye sayılmaz;** "1 Günlük Seri Başladı" yerine "İlk adımını attın". Gerçek eylem (kelimeyi öğrenmek) varsa o kaydedilir.
- **Ad sorulmaz** (kullanıcıdan içerik istenmez kararı); her adımda "Atla" var.
- **İpucu balonları:** ilk sürümde Bugün'de tek, kapatılabilir "hızlı tur" kartı. Sekmelere işaret eden konumlu balonlar ⏳ sonraki sürüm.

### Durum (2026-09-11)

Kod tamam, `tsc` temiz, gözden geçirildi; cihazda görülmedi (bkz. "Cihazda doğrulanacaklar").

- ✅ `src/utils/onboarding.ts` deposu; eski kullanıcı tespiti ilk açılışta bir kez yapılıp kaydediliyor.
- ✅ `OnboardingScreen`: hoş geldin (marka degradesi) → hedefler (1-3, sıralı) → günlük süre → hatırlatma saati (izin yalnızca saat seçilince; reddedilirse hatırlatmasız devam) → ısınma (kelime: günün kelimesi + gerçek "Öğrendim" · konuşma: günün tekerlemesi 3 kez · nefes/zihin/kariyer: 30 sn 4-6 nefesi; "Isınmayı atla") → bitiş özeti. Her adımda "Atla"; Android geri tuşu bir önceki adıma dönüyor.
- ✅ `App.tsx`: ilk rota `onboarding.completed`'a göre; Ayarlar → "Oryantasyonu yeniden göster".
- ✅ Kişiselleştirme: Bugün listesi ve Gelişim hedef sırasına göre (hedef yokken sıra değişmiyor), Gelişim'de "Hedefin" rozeti, Profil'de "Günlük Hedef" ve "Odak Alanları" (panelden değiştirilebilir), Bugün'de kapatılabilir "Kısa tur" kartı.
- ✅ İncelemede düzeltilenler: izin reddedilince bitiş özeti kurulmamış hatırlatmayı "Her gün 20:30" diye gösteriyordu; tekerleme ısınması üst bileşenin state'ini render sırasında değiştiriyordu; ısınma atlanamıyordu ve geri gidilince eski ısınmanın "tamam"ı taşınıyordu; Ayarlar'dan açılan akıştan geri çıkınca bir sonraki açılışta oryantasyon yeniden çıkacaktı. Ortak `Chip`'e erişilebilirlik rolü eklendi.

### Kalanlar

- ⏳ **Konumlu ipucu balonları** — sekmelere işaret eden 4 adımlı tur; şimdilik tek "Kısa tur" kartı.
- ⏳ **Günlük hedef süresinin karşılığı** — `dailyMinutes` yalnızca gösteriliyor; ekranlarda "bu bir hedef, içerik süresi kısalmıyor" yazıyor. Günün pratiğini seçilen süreye göre ayarlama kararı verilmedi.
- ⏳ **Hedefi günlük modülü olmayan alanlar** — Zihin & Odak ve Kariyer & Mülakat'ın günlük pratik modülü yok; yalnızca bunları seçen birinin hatırlatması şimdilik "Günün metni"ne kuruluyor.

---

## 0.2. İlerleme & Profil Sekmeleri UI/UX İyileştirmeleri

**Karar:** İlerleme sekmesindeki boşluk/bozuk görünüm hissini ve Profil sekmesindeki aşırı boşluğu gidermek; her iki sekmenin görsel dengesini, içerik kalitesini ve doluluğunu artırmak.

### Neden Gerekli? (Sistem İncelemesi & Bulgular)

1. **İlerleme Sekmesi (`ProgressScreen.tsx`) Üst Boşluk & Boş Durum Sorunları**:
   - `TabHeader` altındaki ilk `SectionLabel` bileşeni kendi içinde varsayılan `mt-7` (28px) taşıyor. Ekran kodunda üstüne ekstra `<View className="mt-1">` eklenince `TabHeader` açıklaması ile ilk başlık arasında gereksiz büyük bir boşluk oluşuyor.
   - Henüz hiçbir pratik yapılmadığında `SERİLER` boş duruma geçiyor, `ÖLÇÜMLER` tamamen gizleniyor ve `Gelişim Eğrisi` tek satırlık gri bir kutuya düşüyor. Sayfa bu haliyle terkedilmiş/bozuk görünüyor.

2. **Profil Sekmesi (`ProfileScreen.tsx`) Aşırı Boşluk Sorunu**:
   - Ölçüm ve geçmiş ögeleri İlerleme sekmesine taşındıktan sonra Profil ekranı yalnızca tek bir kullanıcı avatar/isim kartından ibaret kaldı (%85 boş alan).
   - Kullanıcının kazanımlarını, günlük hedeflerini veya uygulama tercihlerini görebileceği zengin bir kontrol paneli (Dashboard) eksik.

### Modül Akışı & Bileşen Tasarımı

#### 1. İlerleme Sekmesi (`ProgressScreen.tsx`) İyileştirmeleri
- **Header Boşluğu**: İlk `SectionLabel` üzerindeki ekstra üst marj sıfırlanacak, `TabHeader` ile ilk içerik arasındaki dikey mesafe sıkılaştırılacak.
- **Dengeli Boş Durumlar (Graceful Empty States)**:
  - Hiç seri olmasa bile 4 modül (Günün metni, Diyafram nefesi, Konuşma egzersizi, Belagat) pasif/gri kartlarla listelenecek (ör. *"0 Gün - Henüz Başlanmadı"*), sayfa çökük görünmeyecek.
  - Ölçüm ve Grafik alanına rehber niteliğinde taslak çizgi (Placeholder Chart & Test Prompts) yerleştirilerek kullanıcının ilk testini yapması teşvik edilecek.

#### 2. Profil Sekmesi (`ProfileScreen.tsx`) İyileştirmeleri
- **Günlük Hedef & Tercihler Kartı**: Kullanıcının seçtiği günlük hedef süre (ör. *5 dk/gün*), aktif hatırlatıcı durumu ve odaklandığı ana gelişim sütunları.
- **Kazanımlar & Rozet Vitrini (Milestones / Badges)**:
  - *"İlk Mülakat"*, *"7 Günlük Seri"*, *"Nefes Ustası"*, *"Diksiyon Çırağı"* gibi rozetler ve kilitli başarı simgeleri.
- **Hızlı Erişim Kartları**:
  - Bildirim ve Hatırlatıcı Yönetimi kısayolu.
  - Yapay Zekâ & Çevrimdışı Çalışma Durumu (Offline AI Status indicator).
  - Hakkında, Sürüm (v1.0.0) ve Geri Bildirim kartları.
- **Profil Rengi** — ✅ kod 2026-09-11, ⏳ cihazda görülmedi. Profil düzenleyicide
  altı renk yuvarlak renk kutucuğu olarak seçiliyor, seçili olanda ✓ ve renkli halka.
  Eskiden yalnızca fotoğraf yokken görünüyordu ve seçili renk belli olmuyordu;
  artık her zaman seçilebiliyor: fotoğraf yoksa ikon zeminini, varsa fotoğrafın
  çerçevesini boyuyor (`Profile.avatarTone`). Profildeki "Hatırlatıcılar" satırı
  Hatırlatıcılar ekranına açılıyor.
  - Yapılacak: profil renginin uygulamanın başka yerlerinde de (ör. Bugün
    başlığı, rozetler) kullanılıp kullanılmayacağı kararı.

---

## 0.3. Modül Ayarlarının Modül Ekranlarına Taşınması

**Karar:** Genel `SettingsScreen` (Ayarlar) ekranını aşırı kalabalıktan kurtarmak; modüle özel tüm detaylı tercihleri ilgili egzersiz/modül ekranlarının içerisine taşımak.

### Neden Gerekli? (UX İncelemesi)
- Şu an `SettingsScreen` tek bir dev dosya halinde tüm modüllerin tercihlerini (Diyafram seviyesi/modu, Konuşma tekerleme & dolgu şalterleri, Belagat dal seçimi, Günün metni kaynağı) içeriyor.
- Kullanıcı egzersiz ekranındayken (*ör. Nefes veya Diksiyon*) seviye veya çalışma modunu değiştirmek istediğinde egzersizden çıkıp Profil → Ayarlar'a gitmek zorunda kalıyor.

### Yapılacak Düzenlemeler
1. **Genel Ayarlar Ekranı (`SettingsScreen.tsx`)**:
   - Sadece **Uygulama Geneli** ayarları barındıracak: Tema (Açık/Koyu/Sistem), Bildirim İzinleri & Ana Şalter, Backend AI Sunucu Adresi, Dini İçerik Şalteri.
2. **Modül Ekranlarına Ayar İkonu & Paneli**:
   - `DiaphragmExerciseScreen`: Sağ üst çark ikonu veya modül içi kart ile Çalışma Biçimi (Günlük/Gelişim) ve Seviye (1/2/3) seçimi.
   - `SpeechExerciseScreen`: Tekerlemeler ve Dolgu Kelime Avı aktiflik ayarları.
   - `BelagatExerciseScreen`: Çalışılacak kol seçimi (Meânî, Beyân, Bedî').
   - `DailyTextScreen`: Metin kaynağı seçimi (Dinî, Edebî, Hitabet, Karışık).

### Durum (2026-09-11)

Ayarlar sadeleştirilirken modüle özel tercihlerin bir kısmı ekranlara taşınmıştı,
ama **modül aç/kapa, günlük hatırlatma ve saat** kontrolleri hiçbir yerde
kalmamıştı (`DailyPracticeSettingsSection` hiçbir ekrandan çağrılmıyordu).

Aşağıdakilerin kodu tamam ve `tsc` temiz; cihazda henüz görülmedi (bkz. "Cihazda doğrulanacaklar").

- ✅ Dört modül ekranının (Diyafram, Konuşma, Günün Metni, Belagat) sağ üstünde
  çark düğmesi → `ModuleSettingsSheet` (alttan açılan panel): modül açık/kapalı,
  günlük hatırlatma + saat, ana bildirim şalteri kapalıysa aynı yerden açma,
  modüle özel tercihler (diyafram çalışma biçimi/seviye, konuşma
  tekerleme/dolgu, günün metni kaynağı + ana ekranda göster, belagat kolu).
  Ortak parçalar: `ScreenShell` `right`, `SettingsButton`, `BottomSheet` (`PracticeUI.tsx`).
- ✅ Konuşma ekranındaki satır içi tekerleme / dolgu şalterleri panele taşındı.
  Diyaframın Pratik sekmesindeki mod/seviye seçimi egzersiz akışının parçası
  olduğu için ekranda da kaldı (panelle aynı ayarı gösteriyor).
- ✅ Tüm hatırlatmaların tek listesi: `RemindersScreen` (Bölüm 4).
- ✅ Bildirim ana şalteri `reminderFrequency` ile tutarlı: açılınca sıklık
  "Kapalı" ise "Her Gün" olur, kapatılınca "Kapalı".
- ✅ `DailyPracticeSettingsSection.tsx` mantığı yeni panele taşındı, dosya silindi.

---

## 0.4. SQLite Veritabanı Altyapısına Geçiş (`expo-sqlite`)

**Karar:** Mevcut basit JSON dosya kalıcılığından (`expo-file-system` / `storage.ts`), büyük veri ölçeklenmesi, hızlı kategorik arama ve performans için `expo-sqlite` ilişkisel veritabanı yapısına geçmek.

### Neden Gerekli? (Mimari İnceleme)

- **Şu Anki Durum**: Ayarlar, seriler ve mülakat geçmişi `JSON.stringify` ile tekil `.json` dosyalarına yazılıyor (`readJson` / `writeJson`). Küçük veriler için hızlı ve bağımlılıksız olsa da, veri hacmi büyüdükçe sınırları var.
- **Neden SQLite (`expo-sqlite`)?**:
  1. **Katalog & İçerik Arama (Bölüm 00.2)**: Savunma/genel mülakat soruları, diksiyon tekerlemeleri, meânî/beyân/bedî' soru bankası ve okuma metinleri büyüdüğünde hepsini belleğe yüklü JSON olarak almak yerine SQLite ilişkisel tablolarında indeksli tutmak %100 çevrimdışı ve çok daha hızlı çalışır.
  2. **Gelişmiş Geçmiş & İstatistik Sorguları (Bölüm 5)**: Zaman serisi verileri (tüm mülakat analizleri, egzersiz kayıtları, günlük test sonuçları) binlerce kayıta ulaştığında `GROUP BY`, tarih aralığı filtreleme ve ortalama hesapları SQLite ile anında yapılır.
  3. **Tam Metin Arama (FTS5)**: Soru bankası veya metinler içinde anında kelime araması yapabilme.

### Veritabanı Şeması & Geçiş Planı

- `settings` tablosu (Key-Value)
- `sessions` tablosu (Mülakat oturumları & AI analiz sonuçları)
- `exercise_logs` tablosu (Bilişsel & fizyolojik egzersiz geçmişi)
- `test_results` tablosu (Ölçüm & karne test verileri)
- `catalog_questions`, `catalog_drills` tabloları (Offline hazır katalog)
- İlk aşamada mevcut JSON verilerini SQLite'a aktaran otomatik göç (migration) script'i.

### Aşamalı plan (2026-09-11)

Gerekçe [KARARLAR.md](KARARLAR.md) → "SQLite'a geçiş aşamalı".

| Aşama | İş | Durum |
| --- | --- | --- |
| **1 · Anahtar-değer** | `storage.ts`'in arkası SQLite (`terakki.db` → `kv` tablosu). İlk açılışta `savunma-store/*.json` tek transaction'da aktarılır, dosyalar yedek kalır. `readJson` / `writeJson` API'si ve depolar değişmez. Native modül yoksa dosya depolamasına düşülür, web'de SQLite paketlenmez. | ✅ Kod 2026-09-11 (`db.native.ts`, `db.ts`, `kvImportPlan.ts`, `storage.ts`; aktarım planı betikle sınandı) · ⏳ yeniden derleyip cihazda doğrulanacak |
| **2 · Geçmiş tabloları** | `interview_sessions` ve `exercise_logs` tabloları (sorgu sütunları + kaydın tamamı `data` JSON'unda). `interview-history` / `exercise-history` kayıtlarından tek transaction'da göç; eski kayıtlar yedek kalır; depoların API'si değişmez. Test sonuçları `daily-practice-progress`'te kalıyor (test başına 100 kayıt sınırı, büyümüyor). Tarih aralığı / ortalama sorguları ihtiyaç duyan ekranla birlikte (Bölüm 5). | ✅ Kod 2026-09-11 (`collectionStore.ts`, `historyRowsPlan.ts`, `db.native.ts` şema v2; göç planı ve okuma sırası betikle sınandı; incelemede iki sıra hatası düzeltildi: `INSERT OR REPLACE` analiz eklenince kaydın yerini kaydırıyordu, tam yeniden yazım aynı anlı kayıtları ters çeviriyordu) · ⏳ cihazda doğrulanacak |
| **3 · Katalog** | Soru bankası, tekerlemeler, okuma metinleri ve lugat (hedef ≥500 kelime) `catalog_*` tablolarına; FTS5 ile arama. Bölüm 00.2 ve Bölüm 7'deki içerik büyümesine bağlı. | ⏳ |
| **Temizlik** | Aşama 1 cihazda doğrulandıktan birkaç sürüm sonra `savunma-store/` yedek klasörünün silinmesi. | ⏳ |

Spec'teki ayrı `settings` tablosu kurulmuyor: ayarlar zaten `kv`'de birer anahtar.

---

## 1. Nefes & Beden

**Amaç:** mevcut diyafram modülü nefesin *nereden* alındığını öğretiyor; bu bölüm nefesin
**nasıl yönetildiğini** çalıştırıyor — verişi uzatmak, sabit basınçta tutmak, cümleyi
kalan nefese sığdırmak, baskı altında toparlanmak.

### Ne yapar, ne yapmaz

**Yapmaz — akciğerini büyütmez.** Vital kapasite büyük ölçüde boy, yaş, cinsiyet ve
yapıyla belirleniyor; nefes egzersizleriyle akciğer hacmi anlamlı biçimde artmıyor.
Solunum kaslarının **gücü** artırılabilir, ama bunun yolu dirençli bir cihazla yapılan
inspiratuar kas antrenmanı — telefon uygulamasıyla olmaz.

**Yapar:** verişin kontrolü, nefesin cümleye bölünmesi, baskı anında toparlanma, solunum
kaslarında bir miktar dayanıklılık.

Bu yüzden modülün adında "kapasite" geçmiyor ve uygulama içinde de geçmeyecek.

### Eklenecek egzersizler

"Ne yapar" sütunu abartısız yazıldı; uygulamadaki açıklama metinleri de bunu kullanacak.

| Egzersiz | Ne yapar (gerçekte) | Ölçüm |
| --- | --- | --- |
| **Büzük dudak nefesi** | Burundan 2 sn al, dudakları büzüp 4 sn ver. Verirken hava yollarında hafif geri basınç oluşturur; küçük hava yollarının erken çökmesini ve hava hapsini azaltır. Kapasite artırmaz — boşaltmayı ve veriş kontrolünü iyileştirir. Kanıt tabanı KOAH / pulmoner rehabilitasyon. | Tur sayısı |
| **Kaburga genişletme** | Eller yan kaburgalarda, nefesi yanlara doğru genişleterek al. Göğüs kafesi hareketliliği ve nefesin nereye gittiğinin farkındalığı. Akciğeri büyütmez. | Tur sayısı |
| **Uzatılmış tutma** | Tam al → 3-5 sn tut → yavaş ver. Alma sonunda kalma toleransı, göğüs duvarı esnekliği. Klinikte ameliyat sonrası atelektazi önlemede kullanılıyor; sağlıklı kişide hacim artırmaz. | Tutma süresi (sn) |
| **Basamaklı alma** | 3-4 kısa nefesle kademeli doldur, tek seferde ver. İnspiratuar rezervi hissettirir. Sağlıklıda farkındalık egzersizi. | Basamak sayısı |
| **Maksimum fonasyon süresi (MPT)** | Tek nefeste sabit "aaa" / "sss". Akciğer hacmi ölçüsü **değil** — hem hacim hem ses tellerinin kapanma verimi karışıyor. Diksiyon için anlamlı, kapasite için dolaylı. | Süre (sn) |
| **Kontrol duraklaması** | Nefes ihtiyacına dayanma eşiği. Ölçtüğü şey akciğer değil, refleks toleransı ve alışkanlık. Popüler ölçütlerin (BOLT vb.) sağlık göstergesi olarak kanıtı zayıf — "kapasite skoru" diye sunulmayacak. | sn |
| **Sayarak verme** | Kontrollü verişin konuşmaya çevrilmiş hâli; diksiyona bağlanır. MPT ile aynı çekince. | En yüksek sayı |

### Nefesi daha uzun tutma (2026-09-19)

✅ (kod; cihazda doğrulanacak) — Kullanıcı sordu: "nefesimi daha uzun tutmak için
bir egzersiz var mı?" **Yoktu.** Var olanlar kısa tutma fazlarıydı (4-7-8, kutu
nefesi; 1-7 sn) ve bir de **ölçüm** (`breathHold` testi). Antrenman tarafı boştu;
yukarıdaki tabloda "Uzatılmış tutma" planlıydı ama yazılmamıştı.

| Egzersiz | Tutma | Süre |
| --- | --- | --- |
| **Rahat Tutma — Hazırlık** | 6 sn × 8 tur (4-6-8-2) | 3 dk |
| **Rahat Tutma — Geliştirme** | 12 sn × 8 tur (4-12-8-4) | 4 dk |

**Neden sabit ve kısa tutmalar.** Nefesi uzun tutmayı sağlayan şey akciğer hacmi
değil, büyük ölçüde **CO₂ toleransı ve gevşeme**. "Kendini sına, maksimuma
dayan" tarzı bir tasarım hem yanlış bilgi verir hem tehlikelidir. Bu yüzden iki
egzersiz de sabit, zorlamasız tutma tekrarına dayanıyor ve metinlerde "süreyi
zorlamak başarı ölçüsü değildir" yazıyor.

**Güvenlik uyarıları `description` alanında**, çünkü `breath` motorunda ekranda
yalnızca faz etiketi görünüyor (`instruction` alanı yok) ve detay ekranı
açıklamayı başlamadan önce gösteriyor. Uyarılar: oturarak/uzanarak yap — suda,
araçta veya ayakta asla; **öncesinde hiperventilasyon yapma** (bayılma riski);
baş dönmesi/karıncalanmada bırak; kalp-solunum rahatsızlığı veya gebelikte
hekime danış.

**Yan düzeltme:** `derin-diyafram` egzersizinin açıklamasındaki "Akciğer
kapasitesini geliştiren" ifadesi kaldırıldı — bu bölümün kendi kuralına
aykırıydı ("uygulama içinde 'kapasite' geçmeyecek").

**Açık kalanlar:**

- [ ] **CO₂ tabloları** (sabit tutma, kısalan dinlenme) — asıl ilerletici yöntem
      bu. Şu anki `BreathEngine` her tur için **aynı** fazları çalıştırıyor;
      turdan tura değişen süre desteklenmiyor. Motor `cycles` yerine tur listesi
      alacak şekilde genişletilmeli.
- [ ] Egzersizden çıkan süreyi `breathHold` ölçümüne bağlamak (egzersiz sonunda
      "ölçmek ister misin?" yönlendirmesi). Ölçümün `improvement: 'none'`
      duruşu korunacak — süre artışı yeşile boyanmayacak.

---

### Sade 5 dakikalık 4-6 seansı

Tek düğmeyle başlayan, baştan sona sabit ritimli, süslemesiz rehberli seans:

```
Toplam süre : 5 dakika → 30 döngü
Döngü       : 4 sn burundan al · 6 sn ağızdan ver (tutma yok)
Sayım       : her saniye sayılır, faz adı net gösterilir
Hatırlatma  : aralarda "karnın şişsin, göğsün sabit kalsın"
Bitiş       : tamamlanan döngü sayısı bildirilir
Ton         : sakin, yavaş, zorlamasız — motivasyon cümlesi yok
```

**Kısmen var.** [breathingPrograms.ts:56](src/data/breathingPrograms.ts#L56) içindeki
`l1-awareness` tam bu ritmi kullanıyor ama 6 döngü (1 dk) sürüp başka segmentlere geçiyor.

| İstenen | Şu an | Yapılacak |
| --- | --- | --- |
| 30 döngü, tek ritim | 6 döngü, sonra 4-4-6 ve "sss" | Tek segmentli yeni preset |
| Her saniyeyi say | ✅ Daire içinde geri sayım — görsel, sessiz | Sesli istenirse `expo-av` (var) ile ses dosyası |
| Aralarda hatırlatma | Kısmen — `tip` yalnızca alttaki statik kartta | Her 5 döngüde bir çalışan ekranda göster |
| Bitişte döngü sayısı | ❌ "Program tamamlandı." | `cycleCount` bitiş metnine eklenecek |
| Motivasyon cümlesi yok | ❌ `benefits` listesi gösteriliyor | Bu preset'te gizlenecek |

### Program yapısı

- Ayarlarda artık **iki mod** var: `daily` (kısa bakım programı) ve `progressive`
  (seviyeli uzun program) — `BreathingMode`. Yeni egzersizler `progressive` tarafına girecek.
- **4 haftalık kademeli plan**; hafta başındaki ölçüme göre hedefler belirlenir.
- Mevcut `BreathingProgram` / `BreathingSegment` / `BreathPhase` tipleri yeterli.
  Yeni faz türü gerekebilir (`stackedInhale`) ya da ayrı bir `BreathDrill` tipi yazılır.
- Ekran: yeni `BreathControlScreen`, ya da `DiaphragmExerciseScreen` içinde
  **"Rahatla / Antren"** iki sekmesi.

### ⚠️ Güvenlik

`BreathingProgram.safetyNote` alanı var, görünür kalacak:

- Baş dönmesi, karıncalanma, göğüste sıkışma → **dur**, normal nefese dön
- Nefes tutma egzersizleri **asla suda, araç kullanırken veya ayakta** yapılmaz
- Astım, KOAH, kalp rahatsızlığı, gebelik → hekime danışmadan yapılmaz
- Açık bir "**bu tıbbi tavsiye değildir**" ibaresi
- Güçlü hiperventilasyon protokolleri (Wim Hof tarzı) **eklenmeyecek** — bilinç kaybı riski var

---

### Duruş & Sırt (2026-09-18)

✅ (kod; cihazda doğrulanacak) — Bölüm 1'in adında "Beden" geçiyordu ama içeriği
baştan sona nefesti. Duruş tarafı buradan başlıyor.

**Ne yapar, ne yapmaz.** Bu egzersizler duruş bozukluğunu **düzeltmez**, ağrı
**tedavi etmez**, "postür düzeltme programı" değildir — böyle bir iddia
KARARLAR'daki "Modüller abartılı vaat vermez" kuralına aykırı olurdu. Yaptıkları
şey: uzun oturmada çöken duruşu fark ettirmek ve gerilen bölgeyi gevşetmek.

| Egzersiz | Süre | Ne yapar |
| --- | --- | --- |
| **Duruş Sıfırlama** | 2 dk | Hatırlatıcıdaki tek cümlelik uyarının 5 adımlık hâli: ayak, omuz, çene, omurga, nefes |
| **Omuz ve Göğüs Açma** | 3 dk | Klavye başında öne kapanan omuzları geriye açan aletsiz esnetme |
| **Boyun ve Üst Sırt Molası** | 2 dk | Ekrana eğilmekten gerilen boyun/üst sırt için kısa gevşeme |

Yeni kategori `durus` (`src/data/exercises.ts`), fizyolojik hatta eklendi; yani
Gelişim → **Dinlenme & Denge** alanında kendiliğinden görünüyor, ayrı ekran
gerekmedi.

**Hatırlatıcı bağlandı.** "Duruş kontrolü" aralıklı hatırlatıcısı
(`habitTemplates.ts`) daha önce hiçbir ekrana gitmiyordu; artık bildirime
dokununca Dinlenme & Denge açılıyor. Kısa uyarı yetmediğinde egzersize
geçilebiliyor.

**Açık kalanlar:**

- [ ] Duruş için bir **öz-kontrol ölçümü** (Bölüm 5'teki `diaphragmIsolation`
      gibi 5 maddelik liste: "kulaklarım omuz hizasında mı", "omuzlarım öne
      kapalı mı"…). Karneye yeni bir test olarak eklenir; kişisel skala kullanır,
      nüfus normu yok.
- [ ] Ayakta çalışma / mola sıklığı önerisi — ölçülebilir bir iddia
      kurulamıyorsa hiç eklenmeyecek, karar verilmedi.
- [ ] Görsel anlatım (adım çizimleri). Şu an yalnızca metin var; kaligrafik
      figür üretecine benzer bir yol gerekebilir.

---

### Fikir: "Mikro-Mola & Postür" modülü — değerlendirildi (2026-09-18)

Kullanıcının getirdiği fikir: masa başı saatlerinde 1.5 saatte bir farkındalık
bildirimi ("çeneni serbest bırak, dilini damağına koy, dikleş"), chin tuck /
kürek kemiği sıkıştırma / torasik ekstansiyon egzersizleri, dairesel geri sayım,
streak takibi ve akıcı geçiş animasyonları.

**Değerlendirme: fikrin büyük kısmı zaten kurulu.** Ayrı bir modül açmak yerine
eksik parçalar mevcut yapıya eklenmeli.

| İstenen | Durum |
| --- | --- |
| Zamanlanmış bildirim (aktif saat aralığı, 1.5 saatte bir) | ✅ Var — Bölüm 4a. `habitPlan.ts` aktif saat + gün süzgeci + bütçe yönetiyor; `HABIT_INTERVALS` zaten 90 dk içeriyor |
| Adım adım egzersiz ekranı + geri sayım | ✅ Var — `ExerciseEngineScreen`, `prompt` motoru, `secondsPerPrompt` |
| Chin tuck, kürek kemiği sıkıştırma | ✅ Var — bugün eklenen `durus` kategorisi (Boyun/Üst Sırt ve Omuz/Göğüs egzersizleri) |
| Streak / günlük takip | ✅ Var — `dailyPracticeProgress` serileri + `habitReminders` gün bazlı sayaçları |
| Reanimated mikro etkileşimler | ✅ Var — motor ekranında nabız animasyonu (`useSharedValue` + `scale`) |

**Gerçekten eksik olanlar — yapılacak:**

- [ ] **Çene gevşetme / bruksizm farkındalığı.** Yeni bir aralıklı hatırlatıcı
      şablonu (`cene`) + kısa bir farkındalık ipucu: "dişlerin birbirine
      değmesin, dilin damağında, çene gevşek". Uygulamadaki tek gerçek yeni
      içerik bu.
      ⚠️ **Tıbbi iddia yasak:** bruksizm tıbbi bir durumdur; uygulama onu
      *tedavi ettiğini* ya da "refleksi kırdığını" söyleyemez (KARARLAR →
      "Modüller abartılı vaat vermez"). Metin farkındalık ipucu olarak
      yazılacak, gece diş gıcırdatması için diş hekimine yönlendirme notu
      eklenecek.
- [ ] **Torasik ekstansiyon** ayrı bir egzersiz olarak. Şu an yalnızca
      Omuz/Göğüs ve Boyun egzersizlerinin son adımlarında kısmen geçiyor.
- [ ] **Dairesel geri sayım.** Şu an yatay `ProgressBar` kullanılıyor.
      `react-native-svg` (15.12.1) zaten kurulu, ek bağımlılık gerekmiyor.
      Öncelik düşük — mevcut sayaç işlevsel olarak yeterli.
- [ ] **Bildirimden tek dokunuşla 60-90 sn'lik mini akış.** Şu an "Duruş
      kontrolü" bildirimi kategoriyi açıyor ve kullanıcı egzersiz seçiyor;
      mikro-mola fikri doğrudan akışa girmeyi istiyor.

**Yapılmayacak: Zustand eklenmeyecek.** Fikirde state için Zustand öneriliyor;
projede state tek bir desende: `createPersistentStore`
(`useSyncExternalStore` + ertelenmiş disk yazımı) ve altında SQLite. İkinci bir
state kütüphanesi, `DEVAM.md`'de zaten uyarılan "iki state deseni" sorununu
büyütür ve streak mantığı da sıfırdan yazılmış olur. Yeni durum gerekirse aynı
depo deseniyle eklenecek.

---

## 2. Zihin & Zekâ

**Mevcut:** `BrainExercisesScreen`, `ExerciseEngineScreen`, interaktif beyin görseli ve
egzersiz geçmişi ekranları — beyin bölgelerine dokunarak bilişsel alanlara giriliyor.

### Ne yapar, ne yapmaz

**Yapmaz — zekânı yükseltmez.** Bilişsel egzersizler ağırlıkla **çalışılan görevde**
iyileşme sağlıyor; genel zekâya ya da günlük hayata transferin kanıtı zayıf. Uygulamada
"IQ artırır", "beynini geliştirir" gibi cümleler kurulmayacak.

**Yapar:** düzenli pratikle o beceride ölçülebilir iyileşme, dikkat süresini fark etme
alışkanlığı ve mülakat baskısı altında düşünme provası.

### Eklenecek

| Alan | Egzersiz | Ölçüm |
| --- | --- | --- |
| **Çalışma belleği** | n-back, rakam dizisi geri okuma | Seviye (n), doğruluk |
| **Dikkat & odak** | Seçici dikkat, dikkat dağıtıcı altında görev | Doğruluk, tepki süresi |
| **İşlem hızı** | Sembol eşleme, hızlı aritmetik | Doğru/dk |
| **Mantık & örüntü** | Sayı-şekil örüntüleri, çıkarım soruları | Doğruluk |
| **Hafıza teknikleri** | Loci (hafıza sarayı), gruplama (chunking), akrostiş | Hatırlanan öğe sayısı |
| **Hızlı okuma** | Göz sıçraması, geri dönüşü azaltma | Kelime/dk + anlama testi |

**Mülakata bağlantı:** hafıza teknikleri şirket araştırma notlarını, hızlı okuma sektör
haberlerini, dikkat egzersizleri baskı altında soru dinlemeyi doğrudan besliyor. Her
egzersizin `interviewUse` benzeri bir alanı olacak — belagat modülündeki gibi.

**Zorluk uyarlaması:** skor yükseldikçe seviye artar, düştükçe geri iner. Sabit zorluk
birkaç günde ya sıkıcı ya imkânsız hâle geliyor.

---

## 3. Kariyer & Mülakat

**Mevcut:** şirket/pozisyon seçimli simülasyon, geri sayım, kamera, yapay zekâ analizi
(kriz yönetimi, duruş, akıcılık, dolgu kelime), mülakat geçmişi, sektör haberleri.

### Eklenecek

| Özellik | İş |
| --- | --- |
| **Başvuru takibi** | Hangi şirket, hangi aşama, hangi tarih, sonuç ne oldu — basit bir kanban/liste |
| **STAR cevap kurucu** | Durum → Görev → Eylem → Sonuç şablonuyla cevap yazma ve kaydetme |
| **Şirket araştırma notları** | Şirket başına not defteri; simülasyon öncesi hatırlatılır |
| **Maaş görüşmesi senaryosu** | Ayrı bir simülasyon modu — sayı verme, gerekçelendirme, sessizlik yönetimi |
| **Mülakat sonrası takip** | Teşekkür mesajı şablonu, kendi kendine değerlendirme formu |
| **Teknik soru bankası** | Departman bazlı genişletme; yanlış cevaplananlar tekrar havuzuna düşer |

---

## 4. Alışkanlık & Rutin

**Amaç:** uygulamayı "mülakat öncesi açılan" bir şey olmaktan çıkarıp günlük ritme
yerleştirmek.

### İlk adım (2026-09-11)

✅ (kod; cihazda doğrulanacak) `RemindersScreen` — Gelişim'deki "Alışkanlık & Rutin" kartı, Ayarlar → "Hatırlatıcılar ve alarmlar" ve Profil →
Hatırlatıcılar satırı buraya açılıyor. İçerik: bildirim ana şalteri (izin
akışıyla), test bildirimi, dört günlük pratik modülünün hatırlatma şalteri ve
saati. **4a aralıklı hatırlatıcılar** ve **4b serbest alarmlar** 2026-09-13'te
eklendi (aşağıda); "yakında" bilgi kartı yerini gerçek alarm listesine bıraktı.
Ekran artık üç bölüm: günlük pratik hatırlatmaları, aralıklı hatırlatıcılar,
alarmlar.

### 4a. Aralıklı hatırlatıcılar

Örnek: saatte bir su içme bildirimi.

```
enabled          → açık/kapalı
intervalMinutes  → 30 | 45 | 60 | 90 | 120
activeHours      → { start: 09:00, end: 22:00 }   ← gece uyandırmasın
activeDays       → hafta günleri
message          → özelleştirilebilir metin
```

**Hazır şablonlar:** su içme, ayağa kalk & esne, göz molası (20-20-20), duruş kontrolü,
nefes molası (diyafram modülüne bağlanır), şükür/niyet notu.

**Günlük sayaç:** "bugün 6/10 bardak" — bildirime dokununca artan sayaç.
`dailyPracticeProgress.ts`'teki `dayKey` bazlı yapı aynen kullanılabilir.

### 4b. Serbest alarmlar

✅ (kod; cihazda doğrulanacak) — 2026-09-13

```
{ id, label, time: { hour, minute }, days: [1,2,3,4,5], enabled }
```

| Dosya | Ne yapıyor |
| --- | --- |
| `src/utils/alarmPlan.ts` | Saf planlayıcı: gün normalleştirme, tetikleyici seçimi, bütçe. Node altında 24 durum sınandı |
| `src/utils/customAlarms.ts` | Alarm listesi deposu (`custom-alarms`) + ekle/düzenle/sil/aç-kapat |
| `src/utils/alarmNotifications.ts` | `personal-reminders` kanalı (önem: HIGH), kurulum/iptal |
| `src/screens/RemindersScreen.tsx` | "Alarmlar" bölümü: liste, ekle düğmesi, saat/gün/etiket paneli, silme |

**Tekrarlayan tetikleyici** kullanılıyor (4a'dan farklı): her gün çalan alarm 1
adet `DAILY`, gün seçilmiş alarm gün başına 1 adet `WEEKLY`. Gerekçe
KARARLAR → "Serbest alarmlar tekrarlayan tetikleyici kullanıyor". Uygulama hiç
açılmasa da alarm çalmaya devam ediyor; kayan pencere gerekmiyor.

`sound` alanı **eklenmedi**: özel ses dosyası native tarafta kaynak eklemeyi
gerektiriyor, kanal sesi zaten Android'de kullanıcı tarafından
değiştirilebiliyor. Gerekirse ayrı bir madde olarak açılır.

Liste en fazla `MAX_ALARMS = 10` alarm tutuyor — bütçe öngörülebilir kalsın.

### Uygulama kararları (2026-09-13)

- **Şablondan seçiliyor, sıfırdan yazılmıyor** (`src/data/habitTemplates.ts`): su,
  ayağa kalk & esne, göz molası, duruş, nefes molası, şükür/niyet. Metin
  değiştirilebilir. Hepsi **varsayılan kapalı** — uygulama kendiliğinden bildirim
  yağdırmaz.
- **Planlama saf bir modülde** (`src/utils/habitPlan.ts`): aktif saat aralığı
  slotlara açılıyor, gün süzgeci uygulanıyor, geçmiş slotlar atlanıyor. Node
  altında sınanabiliyor (bu turda 13 durum sınandı).
- **Tek tek tarihli bildirimler**, çünkü tekrarlı tetikleyici saat aralığını
  (`TIME_INTERVAL`) ya da gün süzgecini (`DAILY`) tutamıyor — Teknik kısıt 1 ve 5.
  Pencere: önümüzdeki 2 gün, her açılışta ileri kayıyor.
- **Bütçe:** hatırlatıcı başına günde en fazla 12 slot; toplam plan bütçeye göre
  kırpılıyor ve bütçe hatırlatıcılar arasında **sırayla** paylaştırılıyor (biri
  hepsini yemesin). Kurulamayan bildirim sayısı ekranda dürüstçe söylenecek.
- **Günlük sayaç:** şablonun hedefi varsa ("10 bardak") gün bazlı sayaç tutulur,
  Bugün sekmesindeki kartta artar; gün değişince sıfırlanır.

#### ✅ 4a yapıldı (2026-09-13 — kod; cihazda doğrulanacak)

| Dosya | Ne yapıyor |
| --- | --- |
| `src/data/habitTemplates.ts` | Altı şablon (su, ayağa kalk, göz molası, duruş, nefes molası, niyet) |
| `src/utils/habitReminders.ts` | Ayar + sayaç deposu (`habit-reminders`). Sayaçlar **ayrı alanda**: sayaç artışı bildirim planını tetiklemesin |
| `src/utils/habitPlan.ts` | Saf planlayıcı: slot açma, gün süzgeci, bütçe paylaştırma. Node altında 13 durum sınandı |
| `src/utils/habitNotifications.ts` | Ayrı Android kanalı (`habit-reminders`), tarihli bildirimlerin kurulması/iptali |
| `src/utils/useReminderSync.ts` | Önce günlük pratik, **kalan** bütçe aralıklı hatırlatıcılara |
| `src/screens/RemindersScreen.tsx` | "Aralıklı Hatırlatıcılar" bölümü: şalter, aralık çipleri, aktif saat, gün seçimi, sayaç sıfırlama |
| `src/components/practice/HabitCard.tsx` | Bugün sekmesindeki "Günün Ritmi" kartı: ilerleme + "+1" |

Bildirime dokunmak hem sayacı artırıyor hem (şablonda varsa) ilgili ekranı
açıyor — nefes molası doğrudan diyafram pratiğine gidiyor.

#### ✅ Çözülen hata: bildirim bütçesi aşılıyordu

`syncReminders` "2 günde 1" modunda modül başına 14 tek seferlik bildirim
kuruyordu. Beş günlük pratik modülü açıkken bu **70 bekleyen bildirim** demek ve
iOS'un 64 sınırını şimdiden aşıyordu (sınır aşılınca iOS en eskileri sessizce
düşürüyor, yani bazı hatırlatmalar hiç gelmiyordu).

Çözüm 4a ile geldi: toplam bütçe `NOTIFICATION_BUDGET = 56`, günlük pratiğe
ayrılan pay `DAILY_PRACTICE_RESERVE = 28` (modül başına
`max(2, min(14, 28 / açık modül))`), kalanı aralıklı hatırlatıcılara.
`useReminderSync` bu sırayı koruyor. **Cihazda doğrulanacak** — bkz. "Cihazda
doğrulanacaklar" listesindeki bildirim bütçesi maddesi.

### ⚠️ Teknik kısıtlar — tasarımdan önce çözülecek

1. **Aktif saat aralığı + tekrarlı interval birlikte çalışmıyor.** `TIME_INTERVAL` +
   `repeats: true` 7/24 çalar. Çözüm: aralığı **ayrık `DAILY` bildirimlere açmak**
   (09:00-22:00 / 60 dk → 14 ayrı bildirim).

2. **iOS'ta bekleyen bildirim limiti 64.** Yukarıdaki yöntem limiti hızla yer. Şu an 4
   bildirim kullanılıyor. Çözüm: her açılışta yalnızca **önümüzdeki 2-3 günü** planla.

3. **Silme tarafı çözüldü.** `cancelAllReminders()` artık sabit kimlik listesi yerine
   `getAllScheduledNotificationsAsync()` üzerinden içerikteki `kind === 'daily-practice'`
   alanına bakıyor — dinamik sayıda kayıt da temizleniyor. Yeni modüller kendi `kind`
   değerini koyarsa aynı desen çalışır. Kimlik şeması yine de genişletilecek
   (`savunma.habit.<id>.<slot>`), ama hayalet bildirim riski geçti.

4. **Android 14+ tam zamanlı alarm.** `expo-notifications` varsayılan olarak *inexact*
   alarm kuruyor; sistem birkaç dakika kaydırabilir. Su hatırlatıcısı için sorun değil,
   gerçek "alarm saati" beklentisi için olabilir. Çalan/ısrarlı alarm isteniyorsa
   `expo-notifications` yetmez, native taraf gerekir.

5. **Gün aşırı mod emsal oluşturuyor.** `syncReminders(settings, { everyOtherDay: true })`
   tekrarlayan tetikleyici kullanamadığı için 14 ayrı tek seferlik `DATE` bildirimi kuruyor
   ve pencereyi her açılışta kaydırıyor. Aralıklı hatırlatıcılar da tam olarak bu deseni
   kullanacak — yeniden icat edilmeyecek. iOS 64 limiti bu yüzden daha da önemli:
   tek modül şimdiden 14 slot yiyor.

6. **Bildirim izni akışı zaten doğru**: izin ana şalter açıldığında isteniyor,
   `Device.isDevice` false ise `'unsupported'` dönüyor. Yeni modüller aynı akışı kullanacak.

---

## 5. Ölçüm & Karne

**Amaç:** alıştırma yapmak ayrı, **ilerlediğini görmek** ayrı.

### Zaten var olanlar

Bu bölüm ilk yazıldığında "hiç yok" varsayılmıştı; doğru değil. Karne altyapısının
büyük kısmı çalışıyor:

| Parça | Durum |
| --- | --- |
| `TrendChart` — çok serili çizgi/alan grafiği (`react-native-svg`) | ✅ Var, `ProfileScreen` ve `ExerciseHistoryScreen` kullanıyor |
| `interviewHistory` + `interviewStats` — oturum kaydı, ortalama puan | ✅ Var |
| `exerciseHistory` + `exerciseStats` — süre, adet, favori kategori | ✅ Var |
| `ProfileScreen` — istatistik kutuları + gelişim grafiği + boş durum | ✅ Var, karne ekranı bu |
| `InterviewHistoryScreen` / `ExerciseHistoryScreen` — geçmiş + grafik + yapay zekâ yorumu | ✅ Var |
| `dailyPracticeProgress` — modül serileri, belagat sanatı istatistikleri | ✅ Var |

**~~Yani ayrı bir `TestsScreen` ve `Sparkline` yazmaya gerek yok.~~**
(2026-09-12: `Sparkline` gerçekten yazılmadı — `TrendChart` yetti. Ama testlerin
listesi için ayrı bir ekran açıldı: `MeasurementsScreen`. Gerekçe KARARLAR'da.) Eksik olan tek şey
şu: yukarıdakilerin hepsi *uygulama kullanıldıkça kendiliğinden biriken* veriler.
**Kasıtlı ölçüm** kavramı yok — kullanıcının "şimdi ölçüyorum" deyip tekrarladığı,
zaman içinde karşılaştırılan bir test yok. `longestExhaleSeconds` bunun tek örneği,
o da yalnızca rekoru tutuyor, geçmişi yok.

> **Baştan net olsun:** aşağıdaki testlerin **hiçbiri akciğer hacmi ölçmüyor.** Hacim
> ölçümü spirometre işi. Buradakiler kontrol, dayanıklılık ve konuşma verimi ölçüyor —
> hepsi **kendi geçmişinle** karşılaştırıldığında anlamlı. Ekranda "kapasite" geçmeyecek.

### Testler

| Alan | Test | Birim | Durum |
| --- | --- | --- | --- |
| Nefes | **Kontrollü veriş süresi** — tek nefeste sabit "sss" | sn | ✅ Ölçüm + geçmiş + eğri |
| Nefes | **Nefes tutma** — tam al, tut | sn | ✅ 2026-09-12 · Diyafram → Ölçüm |
| Nefes | **Dinlenik solunum hızı** — 60 sn, her alışta dokun | nefes/dk | ✅ Ölçüm + geçmiş + eğri |
| Nefes | **Kontrol duraklaması** — ilk nefes ihtiyacına kadar | sn | ✅ 2026-09-12 · Diyafram → Ölçüm |
| Nefes | **Diyafram izolasyonu** — 5 maddelik öz-kontrol | 0-5 | ✅ 2026-09-12 · Diyafram → Ölçüm |
| Veriş | **Tek nefeste sayma** | sayı | ✅ 2026-09-12 · Diyafram → Ölçüm |
| Veriş | **Nefes/metin oranı** — metni kaç nefeste okudun | nefes | ✅ 2026-09-12 · Günün Metni |
| Diksiyon | **Okuma hızı** — günün metnini sesli oku | kelime/dk | ✅ Ölçüm + geçmiş + eğri |
| Diksiyon | **Dolgu kelime oranı** — 60 sn serbest konuşma | dolgu/dk | ✅ 2026-09-12 · Konuşma → Fesahat & Kitaplık |
| Diksiyon | **Zayıf ses tespiti** — hangi seslerde takılıyorsun | ses listesi | ⏳ Ertelendi (sonuç sayı değil) — bkz. "Ertelenenler" |
| Zihin | **Bilişsel başlangıç** — n-back + işlem hızı | seviye | ⏳ Ertelendi (Bölüm 2 ile birlikte) |
| Dil & İfade | **Kelime seviye tespiti** — 10 soruluk sınav | % | ✅ 2026-09-12 · Dil & İfade → Alıştırma (seviye **önerir**, ezmez) |
| Belagat | **Sanat seviye tespiti** — 10 soruluk sınav | % | ⏳ İstatistik var, sınav yok (Bölüm 7 → Belagat) |

**Zayıf ses tespiti en değerli bağlantı:** işaretlenen sesler `dictionDrills.ts`'teki
`focus` alanıyla eşleşirse günün seansı otomatik o seslere ağırlık verir.

### Altyapı

```ts
type TestResult = { testId: string; day: string; value: number; note?: string };
```

Ortak parça: `TestTrend` ("son N ölçüm", ilk→son farkı, eğri). `improvement` alanı
üç durumlu — `'higher'` | `'lower'` | `'none'`. Hedefi bir ARALIK olan ölçümlerde
(okuma hızı, dinlenik solunum hızı) `'none'` kullanılıyor: artışı yeşile boyamak
yanlış bilgi verirdi.

**✅ Kuruldu (2026-09-06).** `dailyPracticeProgress.ts` içinde: `TestResult` tipi,
`ProgressState.tests`, `normalize()` satırı, `MAX_TEST_RESULTS = 100` ve genel
`recordTest()` / `testHistory()` / `bestTestValue()` fonksiyonları. Gösterim mevcut
`TrendChart` üzerinden — yeni grafik bileşeni yazılmadı. **Yeni testler bu yoldan
geçecek, altyapı ikinci kez kurulmayacak.**

Yol boyunca çıkan hata: `recordExhaleRecord()` rekor kırmayan ölçümleri tamamen
atıyordu (`if (seconds <= best) return state`), yani ilerleme zaten görülemezdi.
Artık her ölçüm geçmişe giriyor, rekor ayrıca güncelleniyor.

Kalan altyapı işi:

- **Başlangıç testi:** ilk açılışta seviye **önerisi** üretir; kullanıcının seçimini ezmez.
- ~~**Karne toplaması**~~ — ✅ 2026-09-12: ayrı **Karne** ekranı
  (`src/screens/MeasurementsScreen.tsx`) bütün ölçümleri alanlara göre
  (Nefes · Veriş · Diksiyon · Dil & İfade) listeliyor; her testte son değer, eğri
  ve ölçüm ekranını açan "Ölç" düğmesi var. İlerleme sekmesinde yalnızca "Karne"
  düğmesi duruyor ("N/M testte ölçümün var").

### Uygulama kararları (2026-09-12)

- **Tek kayıt:** `src/data/measureTests.ts` — her testin etiketi, birimi, basamağı,
  "iyileşme" yönü, alanı (Nefes / Veriş / Diksiyon / Dil), ölçüldüğü ekran ve
  ölçümden önce gösterilecek koşul notu. Hem test ekranları hem karne buradan okur.
- **Ortak arayüz:** `src/components/practice/MeasureTests.tsx` — `MeasureCard`
  (başlık + koşul notu + sonuç + kaydet + `TestTrend`), `HoldTimer`,
  `CountStepper`, `SelfCheckList`. Yeni test eklemek bir kayıt satırı + küçük bir
  ölçüm arayüzü demek.
- **Yön seçimleri (dürüstlük):** nefes tutma ve kontrol duraklaması `'none'` —
  süreyi uzatmak sağlık göstergesi değil, yeşile boyamak zorlamayı teşvik eder.
  Nefes/metin oranı da `'none'`: cümle arasında nefes almak doğru okumanın
  parçası. Dolgu kelime oranı `'lower'`; tek nefeste sayma, diyafram izolasyonu
  ve kelime seviyesi `'higher'`.
- **Ölçümün kendisi modül ekranında yapılır** (nefes testleri Diyafram'da, okuma
  Günün Metni'nde…), **karne ayrı bir ekranda**: `MeasurementsScreen`, İlerleme
  sekmesindeki "Karne" düğmesiyle açılır (2026-09-12 kullanıcı kararı, bkz.
  KARARLAR "Karne ayrı ekranda"). Karnedeki "Ölç" düğmesi ölçümün yapıldığı
  ekranı doğru sekmesiyle açar.

#### Ertelenenler

- ⏳ **Zayıf ses tespiti** — sonucu sayı değil ses listesi; `TestResult` sayısal.
  Ayrı bir veri yapısı ve `dictionDrills.focus` eşlemesi gerekiyor (Bölüm 6'daki
  "zayıf ses odaklı seans" ile birlikte yapılmalı).
- ⏳ **Bilişsel başlangıç (n-back + işlem hızı)** — başlı başına interaktif bir
  egzersiz; Bölüm 2'deki zihin egzersizleriyle birlikte.
- ⏳ **Başlangıç testi → seviye önerisi** — oryantasyona (Bölüm 0.1) bağlanacak;
  öneri üretir, kullanıcının seçimini ezmez.

### ⚠️ Ölçüm dürüstlüğü

- Bunlar **öz-ölçüm**, klinik ölçüm değil — ekranda açıkça yazacak.
- Hiçbir sonuç "akciğer kapasiten şu kadar" diye sunulmayacak. Ölçülen neyse o yazacak:
  *kontrollü veriş süresi*, *nefes ihtiyacı eşiği*, *konuşma hızı*.
- Karşılaştırma ancak **aynı koşullarda** anlamlı: benzer saat, oturur pozisyon, tok
  karnına değil. Test ekranı bunu ölçümden önce hatırlatmalı.
- Nefes tutma testleri **oturarak**; suda / araç kullanırken asla.
- **Mikrofonla otomatik süre ölçümü** v1'de yok: gürültüde eşik güvenilmez, manuel
  bas-tut daha dürüst sonuç veriyor.

---

### Ölçüme başlama ve "ben neredeyim" skalası (2026-09-13)

✅ (kod; cihazda doğrulanacak)

**Bulunan eksik:** Kronometreyle ölçülen testlerin kendi başlat düğmesi vardı,
ama sayaç/liste ile ölçülen **dört testin hiç "başla" anı yoktu** — ekrana gelen
kişi ne yapacağını anlamıyordu:

| Test | Eskiden | Şimdi |
| --- | --- | --- |
| Tek nefeste sayma | Doğrudan +/- sayaç | "Ölçüme başla" + yönerge |
| Diyafram izolasyonu | Doğrudan işaret listesi | "Öz-kontrole başla" + yönerge |
| Nefes / metin oranı | Doğrudan +/- sayaç | "Ölçüme başla" + yönerge |
| Kelime seviye tespiti | Sınav ilk soruyla açılıyordu | "Sınava başla" kartı |

Kapı `MeasureCard`'ın `startLabel`/`startHint` alanlarıyla ortak; ölçüm zaten
yapılmışsa kapı kapanmıyor (tekrar ölçmek için ikinci kez basmak gerekmesin).

**Skala (`MeasureScale`):** ölçümden sonra değerin nereye düştüğünü gösteren
çubuk. Hem ölçüm ekranlarında hem Karne'de çıkıyor. İki tür — gerekçe
KARARLAR → "Ölçüm skalası norm uydurmaz":

- **Referans:** dinlenik solunum hızı (12-20), okuma hızı (120-150), dolgu
  kelime (kaba ölçek olduğu ekranda yazıyor), diyafram izolasyonu (0-5),
  kelime seviyesi (%0-100).
- **Kişisel:** nefes tutma, kontrol duraklaması, tek nefeste sayma, kontrollü
  veriş, nefes/metin. Bunlarda nüfus normu yok; çubuk kişinin kendi en
  düşük–en yüksek aralığını gösteriyor ve **iki ölçümden önce hiç çıkmıyor**.

**Hesap saf modülde, sınanıyor.** Dilim genişlikleri, işaretçinin yeri ve hangi
dilimde olunduğu `measureTests.ts` içindeki `referenceScalePosition` /
`personalScalePosition` fonksiyonlarında; çizim bunları yalnızca kullanıyor.
Node altında **45 durum** sınandı (sınır değerler, çubuk dışına taşan ölçümler,
kayıt tutarlılığı) — hepsi geçti.

Bunun için ölçüm kimlikleri `src/data/testIds.ts`'e alındı: `measureTests.ts`
eskiden sırf üç dizgi sabiti için `dailyPracticeProgress`'i (dolayısıyla React
Native'i) alıyordu ve bu yüzden saf değildi, Node altında sınanamıyordu. Artık
kimlikler tek kaynakta ve eski alış yolları yeniden dışa aktarımla korunuyor.

**Açık kalan:** Nefes/metin oranı skalası metin değiştikçe kayıyor; "aynı metni
tekrar oku" karşılaştırması (metin kimliğine göre ayrı geçmiş) yapılmadı —
ölçüm geçmişi şu an metin ayırt etmiyor.

---

## 6. Konuşma & Diksiyon

**Mevcut ve çalışıyor:** `SpeechExerciseScreen` + `dictionDrills.ts` — 5 tür, ~20
alıştırma (artikülasyon, 8 tekerleme, vurgu-tonlama, tempo & ses hacmi, dolgu kelime avı),
günün seansı, dolgu sayacı, seans özeti, günün fesahat kusuru.

### Eklenecek

- **Zayıf ses odaklı seans** — Bölüm 5'teki tespite göre günün seansı ağırlık değiştirir
- **Kayıttan dinleme** — kendi sesini kaydet, geri dinle, önceki kayıtla karşılaştır
  (`expo-av` projede var)
- **Sunum provası** — belirlenen süreye konuşmayı sığdırma, süre aşımı uyarısı

---

## 7. Dil & İfade — Lugat & Türkçe

**Amaç:** kelime hazinesini (lugat) geliştirmek, anlamı ve kökeni doğru öğrenmek,
Türkçeyi doğru yazmak ve kullanmak — sütunun ana ekseni bu, söz sanatları
(belagat) değil.

### Neden değişti

İçerik zamanla belagate (söz sanatları) kaymıştı; ama sütunun amacı söz varlığı
ve Türkçe. Karar ve gerekçe [KARARLAR.md](KARARLAR.md)'de.

### İlk sürüm (2026-09-11)

Kodu tamam, `tsc` temiz, içerik gözden geçirildi; cihazda henüz görülmedi
(bkz. "Cihazda doğrulanacaklar").

- ✅ `src/screens/LanguageScreen.tsx` — sekmeler: Kelimeler · Alıştırma · Doğru
  Türkçe · Lugatım; sağ üstte ayarlar (günlük kelime sayısı 3/5, seviye); altta
  Günün Metni ve Söz Sanatları'na geçiş.
- ✅ `src/data/lugat.ts` — **68 kelime** (temel 18 / orta 28 / ileri 22; anlam ve
  köken TDK Güncel Türkçe Sözlük'ten tek tek kontrol edildi), **27 doğru Türkçe
  maddesi** (yazım / anlam / kullanım), **22 deyim-atasözü**, deterministik günlük
  seçim, anlam testi ve boşluk doldurma üreticileri. İncelemede yanlış kural
  öğreten maddeler düzeltildi ("bir şey" / "her şey" açıklamaları aşırı
  genelliyordu, "şoför" açıklaması yanlış heceyi gösteriyordu, "tamamen
  bitirmek" hata değil üslup tercihi olduğu için çıkarıldı).
- ✅ `src/utils/lugatProgress.ts` — öğrenilen/kaydedilen kelimeler,
  doğru/yanlış sayıları, tercihler; bozuk kayıt normalize ediliyor.
- ✅ Gelişim'deki "Dil & İfade" kartı yeni ekrana (`LanguageScreen`) bağlandı;
  görünürlüğü belagat modülünden ayrıldı.

### Günlük pratik modülü (2026-09-11)

Kullanıcı isteği: "günün metni gibi günlük kelime de olsun, ana ekranda da olsun."
Kod tamam, `tsc` temiz, kelime seçimi betikle sınandı; cihazda görülmedi.

- ✅ `lugat` günlük pratik modülü: aç/kapa, hatırlatma + saat, seri
  (`dailyPracticeSettings`, `dailyPracticeProgress`), İlerleme sekmesinde seri
  kartı, modül paneli ve Hatırlatıcılar listesi, bildirime dokununca Dil & İfade.
- ✅ Bugün sekmesi: "Günün Kelimesi" kartı (`DailyWordCard` — bugünün sıradaki
  kelimesi, Öğrendim / Tümü; `lugat.showOnHome` ile kapatılabilir) ve Günlük
  Pratik listesinde "Günün kelimeleri" satırı.
- ✅ Kurallar (KARARLAR → "Ek karar"): önceki günlerde öğrenilenler günün
  listesine girmez, liste gün içinde değişmez; hepsi "Öğrendim" olunca seri
  işlenir; yeni kelime kalmadıysa tekrar günü + "Tekrarı tamamladım".
- ✅ Gelişim'deki Dil & İfade kartının görünürlüğü `lugat.enabled`'a bağlandı.
- ✅ Yol üstünde düzeltilen hata: `useDailyProgress` her ekranda ayrı yerel
  state tutuyordu; Bugün / İlerleme / Profil'deki ✓ ve seriler, başka ekranda
  tamamlanan modülde uygulama yeniden başlayana kadar güncellenmiyordu. İlerleme
  paylaşılan depoya (`createPersistentStore`) taşındı — bütün modülleri etkiliyor.

Belagat ekranı silinmedi; ikincil/ileri düzey bölüm olarak duruyor; belagat
günlük pratik modülü şimdilik olduğu gibi kalıyor.

### Yapılacaklar

- ~~Günlük pratik modülüne bağlama~~ — ✅ 2026-09-11 (yukarıda).
- ~~Gün dönümünde yenileme~~ — ✅ **2026-09-19** (kod; cihazda doğrulanacak).
  Hata: günün içerikleri `React.useMemo(..., [])` ile bir kez hesaplanıyordu,
  uygulama gece yarısını açık geçirirse ekran önceki günde takılı kalıyordu.
  Çözüm: `src/utils/today.ts` → `useDayKey()` — diske yazmayan, paylaşılan bir
  gün anahtarı. İki tetikleyicisi var ve ikisi de gerekli: bir sonraki yerel
  gece yarısına kurulan zamanlayıcı **ve** uygulama öne geldiğinde yeniden
  kontrol (cihaz uyurken zamanlayıcılar kısılıp geç ateşlenebiliyor).
  Saat hesabı (`msUntilNextMidnight`) saf olsun ve Node altında sınanabilsin
  diye `dateUtils.ts`'te duruyor — **15 durum sınandı** (ay/yıl sonu, 23:59,
  gece yarısına 500 ms kala sonsuz döngü koruması).
  Bağlanan yerler: günün kelimeleri (`useTodaysWords` — tek noktadan hem Bugün
  kartını hem Dil & İfade'yi besliyor), günün metni, belagat sanatı, fesahat
  kusuru, günün deyimi, dua + vecize ve Bugün'deki günlük pratik satırları.
  **Bilerek bağlanmayan yer:** mülakat ekranı (`DailyInterviewScreen`). Oradaki
  `setup` seçili soruyu tutuyor; gece yarısı tazelemek yarıda kalan bir mülakatta
  soruyu değiştirirdi — hatanın kendisinden kötü bir davranış olurdu.
- **Deyim/atasözü doğrulaması** — 22 madde TDK Atasözleri ve Deyimler Sözlüğü ile
  henüz tek tek doğrulanmadı (GTS uç noktası deyimler için JSON döndürmedi).
- ~~Lugatın kendi aç/kapa ayarı~~ — ✅ 2026-09-11 (`lugat.enabled`).
- ~~Aralıklı tekrar~~ — ✅ **2026-09-19** (kod; cihazda doğrulanacak).
  `src/utils/spacedRepetition.ts` — saf modül, SM-2'nin sadeleştirilmiş hâli.
  Orijinali cevabı 0-5 "kalite" ile puanlıyor; bizde testler çoktan seçmeli
  olduğu için yalnızca doğru/yanlış var, o yüzden ikili sonuca uyarlandı:

  | | Aralık | Kolaylık |
  | --- | --- | --- |
  | Doğru | 1 → 3 → önceki × kolaylık (tavan 180 gün) | +0.1 (tavan 2.5) |
  | Yanlış | yarına döner | −0.2 (taban 1.3) |

  Tekrar durumu kelime başına `lugatProgress` içinde saklanıyor (`review`).
  **Eski kayıtlarla uyumlu:** alanı olmayan kayıt "hiç planlanmamış" sayılıyor ve
  tekrar sırasında en öne geçiyor; bozuk/elle değiştirilmiş değerler
  `normalizeReview` ile sınırlarına çekiliyor (saçma bir `ease`, kelimeyi sonsuza
  kadar sırada tutabilirdi).

  **Bağlandığı yer:** Alıştırma sekmesindeki *Anlam testi* ve *Boşluk doldurma*.
  Soru üreticileri isteğe bağlı bir "önce bunları sor" listesi alıyor;
  `useDueWordIds(5)` sırası geleni veriyor, kalan yer günün normal
  karıştırmasından doluyor. **Sırası gelmemiş kelime öne alınmıyor** — erken
  sormak aralıklı tekrarın bütün faydasını götürür.

  **Bilerek dokunulmayan yer:** günün kelime listesi kuralları (KARARLAR →
  "önceki günlerde öğrenilenler günün listesine girmez, liste gün içinde
  değişmez"). Tekrar, günlük listeyi yeniden yazarak değil alıştırma sekmesinden
  yüzeye çıkıyor; böylece yazılı bir karar bozulmuyor.

  **Sınandı:** algoritma 23 durum (aralık zinciri, yanlışta sıfırlama, kolaylık
  taban/tavanı, sıralamanın deterministikliği) + değişen soru üreticileri 17
  durum (tercih listesi verilmediğinde eski davranış, bilinmeyen kimlik, uzunluk
  korunumu) — hepsi geçti.

  **Açık:** "tekrar sırasında N kelime" göstergesi / ayrı tekrar modu yapılmadı;
  sayaç için `dueCount()` hazır duruyor.
- **İçerik genişletme** — hedef ≥500 kelime; TDK Güncel Türkçe Sözlük
  doğrulama iş akışı; kaynak/lisans notu.
- **Günün metninde kelime işaretleme** — okurken dokun → anlam.
- **Eş/zıt anlam ve kök-ek (türetme) alıştırmaları.**
- **Deyim/atasözü alıştırması.**
- **Yazım kuralları mini dersleri** — bağlaç "de/da", soru eki "mi", "ki".
- **Okuduğunu anlama soruları** — günün metni üzerinden.
- ~~Seviye tespiti~~ — ✅ zaten yapılmış (Alıştırma → "Seviye tespiti":
  10 soruluk dengeli sınav, `buildLevelQuiz`, sonuç Karne'ye `lugatLevel` testi
  olarak yazılıyor). Liste güncellenmemişti; 2026-09-19'da işaretlendi.
- **Bölüm 0.4** — SQLite kataloğuna taşıma.

### Belagat (ikincil / ileri düzey)

**Mevcut ve çalışıyor:** meânî (8) / beyân (7) / bedî' (12) müfredatı, 6 fesahat
kusuru, öğren → tanı → üret akışı, sanat bazlı doğru/yanlış istatistiği. Lugat &
Türkçe'nin altında, ikincil/ileri düzey bir bölüm olarak duruyor.

**Eklenecek:**

- **Seviye tespit sınavı** (10 soru) ve kol bazlı başarı yüzdesi
- **Zayıf sanat tekrarı** — yanlış bilinen sanatlar tanıma havuzunda daha sık çıkar
- Okuma metinlerindeki sanat etiketleri (`belagatArtIds`) üzerinden **metinden sanata**
  geçiş — metni okurken sanatı işaretleme

---

## 8. Kimlik: isim ve ikonlar

### İsim ✅

**Terakki** (2026-09-07). Kaynak dosyalar, native taraf (`expo prebuild --clean`)
ve derleme tamam; paket kimliği `com.terakki.app`. Gerekçe [KARARLAR.md](KARARLAR.md)'de.

### Logo ✅

Mevcut logo **Kademe** (4 eşit adımla yükselen ve 4. adımı 'sıradaki gelişmeyi' simgeleyen boş modül) olarak belirlendi ve `assets/brand/` altında belgelendi.

### İkon dosyalarının durumu (Güncellendi — 2026-09-11)

Uygulama ikonları `tools/icon-forge/build_from_brand.py` ile `assets/brand/ikon/` SVG'lerinden üretiliyor: degrade `terakki-icon-master.svg`'den (`#10B981` → `#04614A`), figür `terakki-icon-mark.svg`'den (%52 ölçek). Eski `build_app_assets.py` eski Kademe figürünü çizdiği için `--eski-kademe` bayrağı olmadan çalışmıyor.

| Dosya | Gereken | Durum |
| --- | --- | --- |
| `icon.png` | 1024×1024, kenarlara kadar dolu marka degradesi + beyaz figür | ✅ 2026-09-11 — marka degradesiyle yeniden üretildi |
| `splash-icon.png` | 1024×1024, **şeffaf zeminli** beyaz figür (tam boy); `app.json` → `expo-splash-screen` `imageWidth: 170` | ✅ 2026-09-11 — `build_from_brand.py`; degrade + "Terakki" yazısı `SplashOverlay`'de |
| `android-icon-foreground.png` | 1024×1024, **şeffaf**, beyaz figür ortadaki güvenli alanda (%52 ölçek) | ✅ 2026-09-11 — `build_from_brand.py` |
| `android-icon-monochrome.png` | 1024×1024, tek renk beyaz siluet, şeffaf zemin | ✅ 2026-09-11 — `build_from_brand.py` |
| `android-icon-background.png` | 1024×1024 marka degradesi (`#10B981` → `#04614A`) | ✅ 2026-09-11 — `app.json` `backgroundImage` |
| `notification-icon.png` | Beyaz siluet + şeffaf zemin (96×96) | ✅ 96×96, tek renk `#ffffff` siluet — üretildi |
| `favicon.png` | 48×48 web simgesi | ⏳ Dosya `92912c1`'de silindi ama `app.json` → `web.favicon` hâlâ onu gösteriyor |

`app.json` içinde `adaptiveIcon.backgroundColor: "#0A8D65"` (degradenin orta noktası) ve `backgroundImage` / `foregroundImage` / `monochromeImage` yolları bağlı.

### Yapılanlar & Tamamlanan Adımlar

1. ✅ **Logo kararı** — "Kademe" (yükselen 4 modül) markası kabul edildi.
2. ✅ **Şeffaf zeminli türetim** — `tools/icon-forge/build_app_assets.py` ile tek kaynaktan `icon.png`, `splash-icon.png`, `android-icon-foreground.png`, `android-icon-monochrome.png`, `notification-icon.png`, `favicon.png` dosyaları üretildi.
3. ✅ `android-icon-monochrome.png` gerçek siluete çevrildi (şeffaf zemin üzerine beyaz maske).
4. ✅ `favicon.png` 48×48 boyutuna indirildi.
5. ✅ Adaptive icon güvenli alanı ayarlandı (figür %52 ölçekte, güvenli alanın içinde).
6. ✅ `app.json` konfigürasyonu güncellendi.
7. ✅ Native çıktı derlemesi için icon asset'leri `assets/` klasörüne işlendi (`npx expo prebuild --clean` ile kullanılabilir).

### Not: `userInterfaceStyle` ölü ayar

`app.json` `userInterfaceStyle: "light"` diyor ama `expo-system-ui` kurulu değil;
prebuild bunu açıkça uyarıyor ("Install expo-system-ui in your project to enable
this feature"). Uygulama temayı zaten JS tarafında `ThemeContext` ile yönetiyor,
o yüzden acil değil — ama ayar yanıltıcı: kaldırılmalı ya da paket eklenmeli.

---

## 9. Kişisel içerik — dinî mod

⚠️ **Bu bölüm Terakki'ye özeldir.** İrtifa'ya **eklenmeyecek**, Fesahat için
karar **açık** bırakıldı ("belki"). Notlar `YAPILACAKLAR_İRTİFA.md` ve
`YAPILACAKLAR_FESAHAT.md` başlarına yazıldı; gerekçe KARARLAR → "Kişiye özel
içerik diğer uygulamalara taşınmaz".

### Günün Risale-i Nur vecizesi

✅ (kod; cihazda doğrulanacak) — 2026-09-13

Dinî içerik modu (`religiousMode`) açıkken **Bugün** sekmesinde ve **Günün
Metni → Okuma** sekmesinde günün vecizesi görünüyor. Şalter kapalıyken hiçbir
yerde çıkmıyor.

| Dosya | Ne yapıyor |
| --- | --- |
| `src/data/risale.ts` | Vecize havuzu + `pickDailyVecize` (günlük deterministik seçim, salt 9) |
| `src/components/practice/DailyPracticeCard.tsx` | `DailyVecizeCard` — etiket, vecize, sadeleştirme, kaynak |

Günün duasından **ayrı** bir kart: dua kısa bir niyet cümlesi, vecize üzerinde
durulacak bir söz.

### ⚠️ Açık iş: metin doğrulaması

Havuz, yaygın olarak dolaşan vecizelerden kuruldu; **birebir lafız ve künye
(hangi eser, hangi söz/mektup) asıl metinden doğrulanmadı.** Bu yüzden liste
kasıtlı olarak kısa tutuldu (10 madde) — sayıyı artırmak yerine doğruluğu
korumak tercih edildi.

- [ ] Her vecizenin lafzını ve kaynağını asıl metinden doğrula; künyesi
      netleşmeyenlerin `source` alanını düzelt ya da maddeyi çıkar.
- [ ] Doğrulama bitince havuzu genişlet.

### ⚠️ Yapılmadı: Gmail'den çekme

İstenen: vecizelerin Gmail'e gelen günlük e-postadan alınması. **Bu turda
yapılmadı**, çünkü:

1. **OAuth2 gerekiyor.** Gmail API istemci sırrı ister; uygulama içine gömülemez
   (KARARLAR → "Sunucu adresi koda gömülmez" ile aynı gerekçe). Token akışı
   `expo-auth-session` + bir yönlendirme adresi demek.
2. **Çevrimdışı ilkesini deler.** Uygulama sunucusuz %100 çalışmak zorunda;
   vecize kartı ağ bağlantısına bağlanamaz. En fazla *isteğe bağlı bir
   zenginleştirme* olabilir, yerel havuz yine de varsayılan kalmalı.
3. **E-posta ayrıştırma kırılgan.** Bültenin HTML düzeni değişince ayrıştırıcı
   sessizce boş döner; kart o gün boş kalır.

Seçenekler (karar kullanıcıda):

- [ ] **(a) Yerel havuz — şu anki durum.** Doğrulanmış vecizeler koda gömülü.
- [ ] **(b) Elle içe aktarma.** Kullanıcı bir metin dosyası seçer
      (`expo-document-picker`), satırlar havuza eklenir. Çevrimdışı kalır,
      OAuth gerekmez. **En düşük maliyetli gerçek çözüm.**
- [ ] **(c) Sunucu üzerinden.** `server/server.ts`'e Gmail'i okuyan bir uç
      eklenir; uygulama yalnızca sonucu ister. Sunucu kapalıyken yerel havuza
      düşer. OAuth sunucuda kalır, ama sunucu bağımlılığı gelir.

---

## Ortak altyapı işleri

### Tamamlanan Altyapı İşleri (Bölüm 0 & 00)
| Dosya | İş | Durum |
| --- | --- | --- |
| `src/screens/TodayScreen.tsx` | Bugün sekmesi — günlük pratik ve seri takibi | ✅ Yapıldı |
| `src/screens/GrowthScreen.tsx` | Gelişim hub'ı — yedi sütun kartı ve dinamik başlıklar | ✅ Yapıldı |
| `src/screens/ProgressScreen.tsx` | İlerleme sekmesi — seriler, karne ve test eğilimleri | ✅ Yapıldı |
| `src/screens/InterviewScreen.tsx` | Kariyer & Mülakat modülü — simülasyon ve geçmiş | ✅ Yapıldı |
| `src/screens/ProgressScreen.tsx` | Üst marj büzüldü; 4 modül serisi ve rehber test kartları dinamikleştirildi | ✅ Yapıldı (Bölüm 0.2) |
| `src/screens/ProfileScreen.tsx` | Günlük taahhüt, rozet vitrini ve yapay zekâ/sistem durum kartları eklendi | ✅ Yapıldı (Bölüm 0.2) |
| `src/screens/SettingsScreen.tsx` | Modül ayarlarından arındırıldı, genel uygulama ayarlarına odaklandı | ✅ Yapıldı (Bölüm 0.3) |
| `src/screens/SimulationScreen.tsx` | Eski iki işlevli ekran kaldırıldı | ✅ Temizlendi |
| `App.tsx` | Sekmeler 4'e çıkarıldı; stack yönlendirmeleri tamamlandı | ✅ Yapıldı |
| `src/components/ScreenBackground.tsx` | Sekme isimlerine uygun degrade bağlamı eklendi | ✅ Yapıldı |
| `app.json` & `assets/` | Terakki Kademe ikonu (1024x1024), splash ve zemin yeşili (`#059669`) kuruldu | ✅ Yapıldı |
| `assets/` & `tools/icon-forge/` | İkon zemini `assets/brand/ikon/` marka degradesine (`#10B981` → `#04614A`) düzeltildi; figür %52 korundu; iOS `icon.png` ve Android adaptif arka plan aynı degradeden `build_from_brand.py` ile üretiliyor | ✅ Yapıldı (2026-09-11, Bölüm 8) |
| `src/components/SplashOverlay.tsx` & `app.json` | Açılış ekranı: marka degradesi + figür + altında Italianno ile "Terakki". Native splash düz `#0A8D65` + figür (Android 12+ degrade desteklemiyor); JS katmanı onunla aynı karede başlayıp degradeye ve yazıya geçiyor | ⏳ Kod + prebuild tamam (2026-09-11); cihazda gözle doğrulanmadı |
| `src/components/AppUI.tsx` → `Toggle` | Anahtar simetrisi: ölçüler kenarlığı hesaba katmıyordu (tutamak solda 4px, sağda 2px boşluk, dikeyde taşma). Artık dört yönde 3px. Takılma: basılıyken `width` animasyonu her karede yeniden yerleşim yaptırıyordu → `scaleX` + kenar sabitleyen kaydırma | ⏳ Kod 2026-09-11; akıcılık cihazda doğrulanmalı |
| `src/components/AppUI.tsx` → `Segmented` | Uzun etiket ("Günün Sanatı") seçili zeminin dışına taşıyordu: metne `flexShrink` + `adjustsFontSizeToFit` (en çok %80'e küçülür, sonra kısaltılır) ve iç yatay boşluk | ⏳ Kod 2026-09-11; cihazda doğrulanmalı |
| `src/screens/GrowthScreen.tsx` | Kilitli iki kart açıldı (Alışkanlık & Rutin → `Reminders`, Ölçüm & Karne → İlerleme sekmesi); Dil & İfade → `Language`, görünürlüğü `lugat.enabled`'a bağlı | ⏳ Kod 2026-09-11 |
| `src/utils/dailyPracticeProgress.ts` | İlerleme paylaşılan depoya taşındı: başka ekranda tamamlanan modülün ✓'i ve serisi Bugün / İlerleme / Profil'de uygulama yeniden başlayana kadar güncellenmiyordu | ⏳ Kod 2026-09-11; cihazda doğrulanmalı |
| `lugat` modülü + `src/components/practice/DailyWordCard.tsx` | Günlük kelime günlük pratik modülü oldu; Bugün sekmesinde kelime kartı ve liste satırı, hatırlatma, seri (Bölüm 7) | ⏳ Kod 2026-09-11; cihazda doğrulanmalı |
| `src/screens/OnboardingScreen.tsx`, `src/utils/onboarding.ts` | İlk açılış oryantasyonu ve hedeflere göre kişiselleştirme (Bugün, Gelişim, Profil, Kısa tur) — Bölüm 0.1 | ⏳ Kod 2026-09-11; cihazda doğrulanmalı |
| `src/utils/storage.ts`, `db.native.ts`, `db.ts`, `kvImportPlan.ts` | SQLite aşama 1: kalıcılık katmanının arka ucu `terakki.db`; JSON dosyaları tek transaction'da aktarılıyor ve yedek kalıyor; native modül yoksa dosya yolu; Ayarlar → Sistem Bilgileri'nde "Depolama" satırı — Bölüm 0.4 | ⏳ Kod 2026-09-11; yeniden derleyip cihazda doğrulanmalı |
| `src/data/measureTests.ts`, `src/components/practice/MeasureTests.tsx` + Diyafram / Günün Metni / Konuşma / Dil & İfade / İlerleme ekranları | Bölüm 5: 6 yeni ölçüm (nefes tutma, kontrol duraklaması, tek nefeste sayma, diyafram izolasyonu, nefes/metin, dolgu oranı), kelime seviye tespiti ve İlerleme'deki KARNE bölümü | ⏳ Kod 2026-09-12; cihazda doğrulanmalı |
| `src/utils/collectionStore.ts`, `historyRowsPlan.ts`, `interviewHistory.ts`, `exerciseHistory.ts` | SQLite aşama 2: mülakat oturumları ve egzersiz kayıtları kendi tablolarında (`interview_sessions`, `exercise_logs`); `kv`'den bölünmez göç, eski kayıtlar yedek; depo API'leri değişmedi — Bölüm 0.4 | ⏳ Kod 2026-09-11; yeniden derleyip cihazda doğrulanmalı |

### Bekleyen Altyapı & Modül Dosyaları
| Yeni / Değişecek Dosya | İş | Bölüm |
| --- | --- | --- |
| `src/utils/db.native.ts` (aşama 2-3) | İlişkisel tablolar (mülakat oturumları, egzersiz kayıtları, test sonuçları), katalog tabloları ve FTS5 araması | Bölüm 0.4 |
| `src/data/breathControlDrills.ts` | Nefes kontrolü egzersizleri + 4 haftalık plan | Bölüm 1 |
| `src/screens/BreathControlScreen.tsx` | Antrenman akışı + ölçüm | Bölüm 1 |
| `src/data/personalTests.ts` | Test tanımları: birim, talimat, güvenlik notu | Bölüm 5 |
| `src/screens/TestsScreen.tsx` | Ölçüm akışı — kayıt ve karşılaştırma (grafik `TrendChart`'tan) | Bölüm 5 |
| `src/utils/habitReminders.ts` | Aralıklı hatırlatıcı ayarları + slot açma | Bölüm 4 |
| `src/utils/customAlarms.ts` | Serbest alarm CRUD + planlama | Bölüm 4 |
| `src/screens/RemindersScreen.tsx` | İlk sürüm günlük pratik hatırlatmalarını gösteriyor (2026-09-11); aralıklı hatırlatıcı ve serbest alarm bölümleri eklenecek | Bölüm 4 |
| `src/components/practice/HabitCard.tsx` | Ana ekranda günlük sayaç kartı | Bölüm 4 |
| `src/data/cognitiveDrills.ts` | Zihin egzersizleri + zorluk uyarlaması | Bölüm 2 |
| `src/data/breathingPrograms.ts` | 5 dk sade 4-6 preset'i + yeni faz türleri | Bölüm 1 |
| `src/screens/DiaphragmExerciseScreen.tsx` | Preset girişi, aralıklı hatırlatma, bitişte döngü sayısı | Bölüm 1 |
| `src/utils/dailyPracticeSettings.tsx` | Aralıklı hatırlatıcı ayarları (oryantasyon alanları ayrı depoya gitti: `onboarding.ts`) | Bölüm 4 |
| `src/utils/dailyNotifications.ts` | Dinamik kimlik şeması, slot açma, iOS bildirim bütçesi | Bölüm 4 |
| `src/data/dictionDrills.ts` | Zayıf ses eşleşmesi için ses etiketleri | Bölüm 6 |
| `src/screens/SpeechExerciseScreen.tsx` | Dolgu sayacı test formatına bağlanacak | Bölüm 6 |
| `README.md` | Yeni modüllerin özellik listesine eklenmesi | Genel |

### Cihazda doğrulanacaklar (2026-09-11)

Bu turdaki değişiklikler yalnızca `tsc` ile doğrulandı; telefon bağlı değildi.
Build aldıktan sonra bakılacaklar:

- [ ] Ayarlar'daki anahtarlar: tutamak iki uçta da eşit boşlukta mı, açıp kapatırken takılma var mı (özellikle Android).
- [ ] Belagat ekranında "Günün Sanatı" sekmesi taşmıyor mu; diğer dört sekmeli ekranlarda etiketler okunur mu.
- [ ] Dört modül ekranında sağ üst çark → panel açılıyor mu; hatırlatma saati değişince bildirim yeni saate kuruluyor mu.
- [ ] Hatırlatıcılar ekranı: Gelişim → Alışkanlık & Rutin ve Profil → Hatırlatıcılar'dan açılıyor mu.
- [ ] Gelişim → Ölçüm & Karne İlerleme sekmesini açıyor mu.
- [ ] Dil & İfade ekranı: dört sekme, dar ekranda etiketler, öğrenilen/kaydedilen kelimeler uygulama kapanıp açılınca duruyor mu.
- [ ] Günün Kelimesi: Bugün kartında "Öğrendim" → sayaç artıyor mu; hepsi bitince Günlük Pratik listesindeki ✓ ve seri **Bugün sekmesinden çıkmadan** güncelleniyor mu.
- [ ] Paylaşılan ilerleme: başka bir modülü (ör. diyafram) tamamlayıp Bugün / İlerleme / Profil'e dönünce ✓ ve seri uygulamayı yeniden başlatmadan görünüyor mu.
- [ ] Günün kelimeleri hatırlatması: bildirime dokununca Dil & İfade açılıyor mu.
- [ ] Oryantasyon: temiz kurulumda açılıyor mu; uygulamayı zaten kullanan cihazda **açılmıyor** mu; saat seçilince izin isteniyor ve bildirim o saate kuruluyor mu; izin reddinde akış takılmadan ilerliyor mu; nefes ısınması ekrandan çıkınca duruyor mu; bitince geri tuşu oryantasyona dönmüyor mu; Ayarlar'dan yeniden açılıp geri çıkılınca bir sonraki açılışta tekrar çıkmıyor mu.
- [ ] Hedefler: seçince Bugün listesi ve Gelişim sırası değişiyor mu; Profil → Hedef ve tercihler paneli; Bugün'deki "Kısa tur" kartı "Anladım" ile kalıcı kapanıyor mu.
- [ ] **SQLite (önce yeniden derle — `expo-sqlite` native modül):** Ayarlar → Sistem Bilgileri'nde "Depolama: SQLite" yazıyor mu; mevcut profil, seriler, ayarlar, öğrenilen kelimeler ve geçmiş derleme sonrası **aynen** duruyor mu; bir ayarı değiştirip uygulamayı tamamen kapatıp açınca değişiklik kalıyor mu; `savunma-store/` klasörü yerinde (yedek) duruyor mu.
- [ ] SQLite aşama 2: mülakat ve egzersiz geçmişi derleme sonrası aynı sırayla duruyor mu; yeni bir egzersiz (ve sunucu açıksa mülakat analizi) eklenince listede en üstte görünüyor ve uygulama kapanıp açılınca kalıyor mu; geçmişten bir kayıt silinince geri gelmiyor mu.
- [ ] SQLite yedek yolu: yeniden derlenmemiş eski geliştirme derlemesi Metro ile açılınca çökmeden "Depolama: Dosya" ile çalışıyor mu.
- [ ] Ölçümler: her yeni test (nefes tutma, kontrol duraklaması, tek nefeste sayma, diyafram izolasyonu, dolgu oranı, nefes/metin, kelime seviyesi) ölçülüp kaydediliyor mu; ikinci ölçümden sonra eğri çıkıyor mu; koşul/güvenlik notu ölçümden önce görünüyor mu.
- [ ] Karne: İlerleme'deki "Karne" düğmesi ayrı ekranı açıyor mu; ölçümler alanlara göre listeleniyor mu; "Ölç" düğmesi doğru ekranı (ve sekmeyi) açıyor mu; geri dönünce İlerleme'deki sayaç ("N/M testte ölçümün var") güncel mi.
- [ ] Aralıklı hatırlatıcılar (4a): bir şablonu (ör. su) açıp aralığı kısaltınca bildirim **aktif saat aralığı içinde** geliyor mu; aralık dışında (gece) gelmiyor mu; gün süzgeci seçilince yalnız o günlerde geliyor mu.
- [ ] Aralıklı hatırlatıcılar — sayaç: bildirime dokununca Bugün'deki sayaç artıyor mu; kartta "+1" çalışıyor mu; ertesi gün sıfırdan başlıyor mu.
- [ ] Bildirim bütçesi: 5 günlük pratik modülü + "2 günde 1" + birkaç aralıklı hatırlatıcı açıkken hatırlatmalar gelmeye devam ediyor mu (iOS'ta sessizce düşen bildirim var mı).
- [ ] Bildirim kanalları (Android): aralıklı hatırlatıcılar ve alarmlar ayrı kanalda mı — yalnız birini sessize alınca diğerleri gelmeye devam ediyor mu (üç kanal: Günlük Pratik, Aralıklı Hatırlatıcılar, Alarmlar).
- [ ] Serbest alarmlar (4b): alarm ekleyip saatini kurunca **o saatte** çalıyor mu; "her gün" alarmı ertesi gün de çalıyor mu (uygulama hiç açılmadan); gün seçilince yalnız o günlerde çalıyor mu; alarm silinince bir daha çalmıyor mu; kapatılınca susuyor mu.
- [ ] Alarm listesi: 10 alarm sınırına gelince "ekle" pasifleşiyor mu; etiket boş bırakılınca bildirimde "Alarm" yazıyor mu.
- [ ] Sekme ikonları: Diyafram (Pratik/Ölçüm/Rehber), Zihin (Bilişsel/Fizyolojik), Konuşma (Alıştırma/Fesahat), Günün Metni (Okuma/Hız & Tahlil) — emoji yerine ikonlar, dar ekranda etiketler taşmıyor mu.
- [ ] Kaydırma göstergesi: İlerleme ve diğer uzun ekranlarda kaydırırken sağda çubuk görünüyor mu (sayfanın devam ettiği belli oluyor mu).
- [ ] Alt boşluk: dört sekmede de (özellikle İlerleme ve Profil) sayfanın sonuna kaydırınca son kart yüzen sekme çubuğunun altında kalmıyor mu — jest çubuğu olan ve olmayan cihazda.
- [ ] Profil → Hedef ve tercihler: dört satır da basılınca soluyor mu (dokunma geri bildirimi); "Dinî İçerik Modu" satırı Ayarlar'ı açıyor mu ve sağında ok görünüyor mu.
- [ ] Profil rengi: fotoğrafla ve fotoğrafsız, iki temada.
- [ ] Açılış ekranı (splash) geçişi.
- [ ] **Splash başlığındaki 'i' noktası** (2026-09-18: yazı görsele çevrildi, cihazda görülmedi): "Terakki"de son harfin noktası çıkıyor mu; yazı figürün altında ortalı ve eskisiyle aynı boyda mı (genişlik 134px, figürle arası 21px)? Görselin kendisi bilgisayarda doğrulandı — nokta yerinde, e/a gözleri açık.
- [ ] Splash hızı: font beklemesi kalktığı için native (düz yeşil) ekrandan degradeli ekrana geçiş eskisinden erken olmalı.
- [ ] **İlerleme ekranı** (2026-09-18'de sadeleştirildi): üç bölüm (Özet · Seriler · Kayıtlar) düzgün duruyor mu; seriler tek kart içinde eşit satırlar hâlinde mi (eskiden 5 kart 2 sütuna dizilip sonuncusu yalnız kalıyordu); üç kayıt satırı (Karne, Mülakat, Egzersiz) aynı biçimde mi; gelişim eğrisi verisi yokken bölüm hiç görünmüyor mu.
- [ ] Splash süresi: **sürüm (release) derlemesinde** düz yeşil native ekran ne kadar duruyor? Geliştirme derlemesinde Metro paketi yüklendiği için 4-5 sn sürüyor; sürüm derlemesinde kısa olmalı. Uzun kalıyorsa ayrı madde açılacak.
- [ ] Türkçe büyük harf (2026-09-18'de düzeltildi): Bugün'de "GÜNÜN KELİMESİ" ve "GÜNLÜK PRATİK", Profil'de "PROFİLİ DÜZENLE", Karne'de alan başlıkları ("DİL & İFADE") noktalı İ ile mi çıkıyor; hiçbir başlık taşmıyor mu (İ noktası satır yüksekliğini bozabilir).
- [ ] Bugün sekmesi sadeleşmesi: dua ve vecize tek kartta mı; seri kartı ve alttaki "Gelişim sekmesine bak" yazısı gitti mi; dinî mod kapalıyken kart hiç çıkmıyor mu. Günün Metni → Okuma sekmesinde de aynı birleşik kart görünüyor mu.
- [ ] Gelişim sekmesi: alan listesi 6 satır mı (Ölçüm & Karne kalktı); sıralama hedeflere göre hâlâ doğru mu.
- [ ] Duruş egzersizleri: Gelişim → Dinlenme & Denge içinde "Duruş & Sırt" kategorisi görünüyor mu; üç egzersiz de açılıp adım adım ilerliyor mu; süreler (2/3/2 dk) tutuyor mu.
- [ ] "Duruş kontrolü" hatırlatıcısı: bildirime dokununca Dinlenme & Denge açılıyor mu (eskiden hiçbir yere gitmiyordu); sayaç yine artıyor mu.
- [ ] Nefes tutma egzersizleri: Dinlenme & Denge'de "Rahat Tutma — Hazırlık/Geliştirme" görünüyor mu; nefes dairesi 6 ve 12 saniyelik tutma fazlarını doğru sayıyor mu; **güvenlik uyarıları detay ekranında başlamadan önce okunuyor mu** (uyarı metni uzun, kartta kesiliyor mu).
- [ ] Gün dönümü: uygulamayı açık bırakıp cihaz saatini gece yarısını geçecek şekilde ileri al (ya da 23:59'da aç) — Bugün'deki günün kelimesi, günün metni, dua/vecize ve günlük pratik satırları kendiliğinden yenileniyor mu; uygulamayı arka plana alıp geri getirince de yenileniyor mu (zamanlayıcı kısılmış olabilir). Yarıda kalan bir mülakatta sorunun **değişmediği** de görülmeli.
- [ ] Aralıklı tekrar: Alıştırma → Anlam testinde bir kelimeyi bilerek **yanlış** cevapla, testi yeniden aç — o kelime ilk sorularda mı geliyor? Doğru cevaplanan kelime ertesi gün gelmemeli (cihaz saatini bir gün ileri alarak bak). Eski kurulumdan gelen kayıtlar (tekrar alanı olmayan) ekranı çökertmiyor mu.
- [ ] İlerleme (ikinci sadeleştirme): Seriler kartında yalnızca başlanmış modüller satır mı; başlanmamışlar altta adlarıyla tek satırda mı; **hiçbiri başlanmamışken** kart yalnız o satırı gösterip düzgün duruyor mu; hepsi başlanmışken özet satırı hiç çıkmıyor mu. Özet kutuları alçaldı — iki tema ve dar ekranda sayılar/birim taşmıyor mu. Egzersiz Geçmişi ve Egzersiz Detayı ekranlarındaki kutuların boyutu **değişmemiş** olmalı. Bir de "EGZERSİZ" başlığı noktalı İ ile mi çıkıyor.
- [ ] Ölçüme başlama: tek nefeste sayma, diyafram izolasyonu, nefes/metin oranı ve kelime seviye tespitinde "başla" düğmesi çıkıyor mu; basınca ölçüm arayüzü açılıyor mu; ölçüm kaydedildikten sonra kapı geri kapanmıyor mu.
- [ ] Skala: ölçümden sonra çubuk çıkıyor mu, işaretçi doğru yerde mi (ör. 16 nefes/dk "Tipik" diliminde); Karne'de de aynı çubuk görünüyor mu; dar ekranda dilim etiketleri taşmıyor mu; iki temada okunuyor mu.
- [ ] Kişisel skala: tek ölçümde çubuk yerine "ikinci ölçümünden sonra" yazısı çıkıyor mu; iki farklı ölçümden sonra çubuk beliriyor mu; bütün ölçümler aynıysa uyarı satırı çıkıyor mu.
- [ ] Günün vecizesi: dinî içerik modu açıkken Bugün ve Günün Metni → Okuma'da görünüyor mu; kapatınca ikisinden de kayboluyor mu; ertesi gün vecize değişiyor mu (duayla aynı sıraya düşmüyor mu).

---

## Sadeleştirme turu (2026-09-18)

Kullanıcı "uygulamada yoğunluk var, gereksizlikleri çıkaralım" dedi; kaldırılacaklar
kendisine sorularak seçildi.

**İlerleme ekranı yeniden kuruldu.** İki sorun vardı: beş seri kartı iki sütunlu
ızgaraya diziliyordu ve tek sayı olduğu için sonuncusu yarım satırda yalnız
kalıyordu; ayrıca aynı ekranda üç ayrı kart biçimi vardı. Ekran üç bölüme indi —
**Özet · Seriler · Kayıtlar** — seriler tek kartın içinde eşit satırlar hâline
geldi, üç kayıt girişi (Karne, Mülakat, Egzersiz) ortak `ActionRow` biçimine
çekildi. Gelişim eğrisi artık yalnızca çizilebilecek verisi varken görünüyor;
"veri yok" kartı kaldırıldı.

**Bugün sekmesi:**

- Günün duası ve günün vecizesi **tek kartta** birleşti (`DailyFaithCard`).
  İkisi de aynı şaltere bağlıydı ve arka arkaya iki kutu olarak duruyordu.
  Aynı bileşen Günün Metni ekranında da kullanılıyor; oradaki ayrı dua bloğu
  kaldırıldı.
- "N günlük seri" kartı kaldırıldı — aynı bilgi İlerleme → Seriler'de var.
- Alttaki "Çalışacak yeni bir alan mı arıyorsun? Gelişim sekmesine bak"
  yönlendirmesi kaldırıldı; sekme çubuğu zaten hep ekranda.

**Gelişim sekmesi:** "Ölçüm & Karne" alanı listeden çıkarıldı — tek yaptığı
İlerleme sekmesini açmaktı, yani bir dokunuş uzaktaki yeri tekrar ediyordu.
Ayrıca yorum içinde bekletilen ölü "Tüm Egzersiz Kataloğu" kartı silindi.

### İkinci tur — İlerleme hâlâ kalabalıktı (2026-09-19)

Kullanıcı ilk sadeleştirmeden sonra "yine kalabalık geldi" dedi. Sayıldı:
4 bölüm başlığı + 10 içerik bloğu. İki gerçek fazlalık bulundu ve ikisi de
kullanıcıya sorularak çözüldü:

- **Seriler:** beş modülün hepsi listeleniyordu, başlanmamış olanlar "0 gün"
  yazan ama bilgi vermeyen satırlardı. Artık yalnızca **başlanmış** modüller
  satır oluyor; başlanmamışlar kartın altında **adlarıyla** tek satırda
  özetleniyor ("Henüz başlanmadı: Günün metni · Belagat"). Kullanıcı adların
  görünmesini özellikle istedi — hangi modüle hiç başlamadığını bilmek bilgi.
- **Özet:** kullanıcı tasarımı beğendi ama küçültülmesini istedi. `StatTile`'a
  isteğe bağlı `compact` eklendi (dolgu, ikon kutusu, sayı puntosu ve satır
  araları küçüldü). **Varsayılan boyut değişmedi**, çünkü aynı bileşeni Egzersiz
  Geçmişi ve Egzersiz Detayı ekranları da kullanıyor.

**Yol üstünde bulunan hata:** `StatTile` etiketi CSS `uppercase` ile büyütüyordu,
yani "Egzersiz" ekranda **"EGZERSIZ"** (noktasız I) çıkıyordu. Etiket prop'tan
geldiği için 2026-09-18'deki statik başlık düzeltmesine yakalanmamıştı; artık
`trUpper` kullanıyor.

---

## ⚠️ Bulunan hata: Türkçe büyük harf dönüşümü (2026-09-13)

Cihaz ekran görüntüsünde Bugün sekmesindeki başlık **"GÜNÜN KELIMESI"** çıkıyor —
noktasız I ile. Doğrusu "GÜNÜN KELİMESİ".

**Sebep:** Kaynakta yazı `Günün Kelimesi` (`DailyWordCard.tsx`) ve başlık CSS
`uppercase` sınıfıyla büyütülüyor. Hem CSS `text-transform` hem JavaScript'in
`toUpperCase()`'i Türkçeye duyarsız: `i → I` yapıyor, `i → İ` yapmıyor.
(Aynı şekilde `ı → I` olması gerekirken `I` çıkması tesadüfen doğru.)

**Kapsam:** 58 yerde `uppercase` sınıfı, 1 yerde açık `toUpperCase()`
(`MeasurementsScreen.tsx`). Hepsi etkilenmiyor — yalnızca içinde 'i' geçen
başlıklar bozuluyor ("Kelimesi", "Pratik", "İfade"…).

**✅ Çözüldü (2026-09-18) — cihazda doğrulanacak.**

Seçilen yol ikili:

- **Sabit başlıklar** kaynakta doğrudan büyük harfle yazıldı (GÜNÜN KELİMESİ,
  GÜNLÜK PRATİK, PROFİLİ DÜZENLE…). `uppercase` sınıfı yerinde bırakıldı; zaten
  büyük harfe dokunmuyor, böylece diff küçük kaldı. 12 dosyada 15 başlık.
- **Çalışma anında üretilen** metinler için `src/utils/text.ts` → `trUpper()`
  eklendi (`i→İ`, `ı→I` eşlemesinden sonra büyütüyor). Karne'deki
  `AREA_LABELS[...].toUpperCase()` buna çevrildi — "Dil & İfade" artık
  "DİL & İFADE" oluyor, "DIL & İFADE" değil. `trLower()` de aynı gerekçeyle var.

⚠️ Dikkat: `uppercase` sınıfı duran yerlere ileride küçük harfli bir başlık
yazılırsa hata geri döner. Yeni başlıkları ya doğrudan büyük harfle yaz ya da
`trUpper`'dan geçir.

---

## Açık sorular

- [x] ~~Uygulama adı ne olacak?~~ **Terakki** (2026-09-07). Ayrıntı [KARARLAR.md](KARARLAR.md)'de.
- [x] ~~Sekme yapısı ne olacak?~~ **Dört sekme: Bugün · Gelişim · İlerleme · Profil**
      (2026-09-08). Ayrıntı Bölüm 0'da.
- [x] ~~Testler ayrı sekme mi, `ProfileScreen` altında "karne" bölümü mü?~~
      **Ayrı sekme (İlerleme)** ve yedi sütunun tamamını gösterecek.
- [ ] Nefes modülü ayrı ekran mı, `DiaphragmExerciseScreen` içinde iki sekme mi?
- [ ] Alarm beklentisi: sıradan bildirim mi, çalan/ısrarlı alarm mı? (İkincisi native iş.)
- [ ] Sayım sesli mi olacak? `expo-av` var; konuşan sayım için `expo-speech` gerekir.
- [ ] Zayıf ses tespiti günün seansını otomatik mi değiştirsin, öneri olarak mı kalsın?
      (Otomatik olursa günlük içerik deterministik olmaktan çıkar; bildirim metniyle
      ekran içeriği tutmayabilir.)
- [ ] Su sayacı hedefi sabit mi (8 bardak), kullanıcı mı belirleyecek?
- [ ] Günün vecizesi nereden gelsin: yerel havuz mu, elle içe aktarma mı, sunucu
      üzerinden Gmail mi? (Bölüm 9 → "Yapılmadı: Gmail'den çekme" — üç seçenek
      gerekçeleriyle orada.)
