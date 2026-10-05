# Kararlar

Verilmiş ve verilmemiş kararlar. Bir karar değiştiğinde burası güncellenir;
gerekçesi de kalır ki aynı tartışma ikinci kez yapılmasın.

> ⚠️ **Bu dosya Terakki'den devralındı** (fork 2026-10-04/05). **Teknik**
> kararlar İrtifa'da da geçerli: SQLite'a aşamalı geçiş, `createPersistentStore`
> deseni, BYOK, mülakat ses kayıtlarının cihazda saklanması, bildirim
> planlamasının tek yönlü olması, iOS 64 bekleyen bildirim sınırı, ölçüm
> skalasının norm uydurmaması, koyu temanın nötr olması.
>
> **Ürün** kararları devralınmadı: uygulamanın adı, yedi sütun kapsamı, dinî mod,
> lugat ve belagat müfredatı. Bunları anlatan bölümler **tarihsel kayıt** olarak
> duruyor — İrtifa'nın kendi kararları en altta, "İrtifa kararları" başlığı
> altında.

---

## Verildi · Uygulamanın adı: **Terakki**

**Karar (2026-09-07):** Uygulamanın adı **Terakki**.

**Neden:** "Terakki" ilerleme, yükselme, gelişme demek — kişisel gelişimin birebir
Türkçe karşılığı. Uygulamanın yedi sütununun (kariyer, diksiyon, belagat, nefes,
zihin, alışkanlık, ölçüm) hepsini kapsıyor ve ölçüm/karne fikriyle de uyumlu.
Eski isimlerin üçü de mülakata kilitliydi; uygulama artık mülakattan ibaret değil.

**Elenenler:** Talim (sıradan, askerî çağrışım), Meleke (ayırt edici ama açıklama
istiyor), Mihenk (ölçümü öne çıkarıyor, egzersiz tarafını anlatmıyor), Pusula
(çok kullanılmış metafor, isim çakışması riski yüksek).

### Yeni kimlikler

| Yer | Değer |
| --- | --- |
| Uygulama adı (`app.json` → `name`) | `Terakki` |
| Expo slug | `terakki` |
| Android paketi | `com.terakki.app` |
| iOS bundle id | `com.terakki.app` |
| npm paket adı | `terakki` |
| Sunucu paketi | `terakki-backend` |
| Repo (hedef) | `terakki` |

### ⚠️ Paket kimliği tek seferlik

`com.savunmamulakat.mobile` → `com.terakki.app` değişimi **yeni bir uygulama** demek:
telefondaki eski kurulum güncellenmez, yan yana ikinci bir uygulama olarak kurulur ve
eski kurulumun verileri (profil, ilerleme, ayarlar) yeni uygulamada görünmez. Uygulama
henüz yayınlanmadığı için bedeli yok — **Play Store'a çıktıktan sonra imkânsız olurdu.**
Eski uygulama telefondan elle silinmeli.

### Uygulandı (2026-09-07)

Kaynak dosyalar önceki turda, native taraf bu turda: `npx expo prebuild --clean`
`android/` ve `ios/`'u `com.terakki.app` ile baştan üretti, `expo run:android`
başarıyla derleyip cihaza kurdu, uygulama çalışıyor. Doğrulanan değerler
[DEVAM.md](DEVAM.md)'de.

Cihazdaki eski kurulumun paket adı beklenen `com.savunmamulakat.mobile` değil,
**`com.savunma.kariyer`** çıktı (sürüm 1.0.18) — telefondaki son kurulum daha
eski bir yapılandırmadan kalmış. Silinecek olan bu.

Kalan iki iş kullanıcı eylemi: GitHub reposunun yeniden adlandırılması
(`gh` CLI bu makinede kurulu değil) ve eski uygulamanın telefondan silinmesi.

---

## Açık · Logo ne olacak

**Soru:** Mevcut logo — kalkan içinde beyin + roket — Terakki adıyla uyumlu mu?

**Neden soru:** Kalkan savunma sanayii amblemi; uygulama "Savunma AI" iken
yerindeydi. Uygulama artık yedi sütunlu bir kişisel gelişim uygulaması ve adı
"ilerleme, yükselme" demek. Kalkan koruma anlatıyor, ilerleme değil.

**Neden bekletilemez:** Bütün ikon işi (Bölüm 8) buna bağlı. Üstelik mevcut
görsel *mavi zemin üzerine beyaz figür* olduğu için şeffaf splash ikonu ondan
**türetilemiyor** — zemini silince beyaz üstüne beyaz kalıyor. Logo ya yeniden
çizilecek ya da zeminden bağımsız, renkli bir figüre dönüştürülecek. Her iki
durumda da önce karar gerekiyor.

**Bağlı olan:** `icon.png`, `splash-icon.png`, `favicon.png`,
`android-icon-foreground.png`, `android-icon-monochrome.png`,
`notification-icon.png` ve ana ekrandaki kalkan ikonu.

---

## Verildi · Splash zemini temaya göre ayrılacak

**Karar (2026-09-07):** Açılış ekranı zemini tek renk olmayacak; açık temada
beyaz, koyu temada `#121214` olacak.

**Neden:** `splash.backgroundColor` şu an `#ffffff`. Koyu tema kullanan biri
uygulamayı her açtığında tam ekran beyaz bir flaş görüyor, ardından arayüz
karartıyor. Marka mavisi de düşünüldü ama açık/koyu geçişinde uygulamanın
kendi zeminiyle uyuşmuyordu.

**Bedeli:** `expo-system-ui` kurulacak ve `app.json`'a ayrı bir koyu tema
yapılandırması girecek. Şu an `userInterfaceStyle: "light"` ayarı da bu paket
kurulu olmadığı için ölü duruyor — ikisi birlikte çözülecek.

**Bağlı:** ikon işiyle aynı turda yapılacak, çünkü ikisi de
`npx expo prebuild --clean` gerektiriyor.

---

## Verildi · Yapay zekâ uygulamayla gelir, ama şart değildir

**Karar (2026-09-08):** Yapay zekâ özelliği kullanıcıdan hiçbir kurulum
istemeden çalışmalı. Aynı zamanda uygulama, yapay zekâ hiç çalışmasa da
**tam** kullanılabilir olmalı.

**Neden:** `DEFAULT_API_BASE_URL` şu an `''`. Yani yeni bir kullanıcı mülakat
analizini görmek için kendi makinesinde Express sunucusu ayağa kaldırıp
telefonu aynı ağa almak zorunda. "Başkaları da kullansın" hedefi bu satırda
duruyordu.

**Elenen seçenek (2026-09-08):** kullanıcının kendi API anahtarını girmesi —
anahtar almak için Google hesabı, konsol, fatura kartı adımları var; sıradan
kullanıcı buradan döner.

> ⚠️ **Bu eleme 2026-09-20'de geri alındı.** Aşağıdaki "Yapay zekâ kullanıcının
> kendi anahtarıyla çalışır" kararı bu bölümün yerini alıyor: BYOK artık
> varsayılan yol. Gerekçe orada.

### Bedavaya nasıl olur — araştırılacak yol

Kurgu şu: mevcut `server/server.ts` proxy'si ücretsiz bir sunucusuz platforma
konur, arkasında Gemini'nin ücretsiz kotası kullanılır. Anahtar sunucuda kalır,
uygulama anahtarı hiç görmez — bugünkü mimari zaten böyle.

⚠️ **Doğrulanmadı.** Aşağıdakiler karar verilmeden önce sınanmalı:

- Ücretsiz kotanın gerçek sınırı ne, ve o sınır **tüm kullanıcılar arasında
  paylaşılıyor** (anahtar tek). Kullanıcı sayısı arttıkça kota biter.
- Sunucusuz platformların ücretsiz katmanları (Cloudflare Workers, Vercel,
  Render vb.) hangi limitlerle geliyor.
- Kötüye kullanım: açık bir proxy'yi herkes çağırabilir. `APP_TOKEN` mekanizması
  sunucuda zaten var ama tek başına yeterli değil; cihaz başına hız sınırı
  gerekiyor.

**Bu yüzden ikinci kural şart:** kota bittiğinde, sunucu kapalıyken ya da ağ
yokken uygulama **bozulmaz**. Yapay zekâ bir bonus katman; günlük pratik,
egzersizler, ölçüm ve karne ona hiç dokunmadan çalışır. Mülakat modülü yapay
zekâsız da soru sorar ve süre tutar, yalnızca analiz kısmı devre dışı kalır.

---

## Verildi · Kullanıcıdan içerik yazması istenmez

**Karar (2026-09-08):** Uygulama kullanıcıya "kendi kurumunu ekle", "kendi
sorularını yaz" gibi içerik üretme işi yüklemez. Alan seçimi **hazır listeden
tek dokunuşla** yapılır.

**Neden:** Önceki öneri, alanı koddan çıkarıp kullanıcıya bırakmaktı. Doğru
teşhis, yanlış çözüm: veri girmek zorunda kalan kullanıcı uygulamayı bırakır.

**Doğrusu:** alan yine koddan çıkar ama **kullanıcıya değil, hazır kataloğa**
gider. Bugün `CompanyId` beş savunma sanayii şirketinden oluşan bir *tip*;
`DEPARTMENTS` üç bölümle sınırlı; `defenseNews.ts` sektöre kilitli. Bunlar
seçilebilir veri hâline gelir, savunma sanayii kataloğun **bir** girdisi olur.
Kullanıcı ilk açılışta yalnızca seçer.

Serbest metin yalnızca **isteğe bağlı** yerlerde kalır (profildeki "Kariyer
Hedefi" gibi) ve boş bırakılabilir — `careerContext()` zaten boşken cümle
kurmuyor.

---

## Verildi · Modüller abartılı vaat vermez

**Karar:** Bir modülün metni ölçtüğü şeyi yazar; karşılığı olmayan iyileştirme
vaadi kurulmaz.

**Neden:** "Akciğer kapasiteni artırır" ve "zekânı geliştirir" tipi cümlelerin
karşılığı yok. Vital kapasite boy/yaş/yapıyla belirleniyor, nefes egzersizleriyle
anlamlı ölçüde artmıyor; bilişsel egzersizler de ağırlıkla çalışılan görevde
iyileşme sağlıyor, genel zekâya transferin kanıtı zayıf.

**Uygulandı (2026-09-06):** koddaki yedi metin düzeltildi — ekrandaki
"Kapasite Testi" → "Kontrollü Veriş Süresi", erişilebilirlik etiketi,
`dailyPracticeProgress` ve `BreathingMode` yorumları, ayarlardaki "seviyeli
kapasite programı", `BrainExercisesScreen` alt satırı ve `exercises.ts`'teki
açıklama + fayda cümlesi.

---

## Verildi · Tasarım: mevcut dili sadeleştir

**Karar:** Yeni bir tasarım dili kurulmuyor. Renkler, bileşenler ve island alt
menü aynı kalıyor; görsel gürültü azaltılıyor.

**Uygulandı (2026-09-06):** `Surface` gölge yerine tek 1px kenarlığa indi, sekme
başlıkları `23px/black` → `22px/semibold`, bölüm etiketleri `11px` → `10px` +
geniş tracking, günlük pratik listesindeki satır ayırıcıları kaldırılıp yerini
boşluk aldı.

### Degrade yönü — denendi, geri alındı

Bir ara degradenin renkli ucu üste alınmıştı (gerekçe: altta içeriğin yoğun
olduğu yeri boyuyor). **Kullanıcı eskisini tercih etti.** Yön geri alındı:
yukarıdan aşağı koyulaşıyor, `locations` yine `[0, 0.4, 1]`. Bunun yerine
doygunluk düşürüldü — alt uç `#bfdbfe` (blue-200) yerine `#dfeafc`, mor ve
yeşil sekmelerde de aynı ölçüde soluk. Yön tartışması kapandı.

---

## Verildi · Koyu tema nötr olacak

**Karar:** Açık tema beyaz + gri tonlarıyla kuruluyorsa koyu tema da siyah + gri
tonlarıyla kurulur. Renk yalnızca vurguda (mavi/mor/yeşil ikon kutuları, sekme
zemini) bulunur; yüzeylerde bulunmaz.

**Neden:** Koyu temada kartlar ve zeminler lacivert tonlarındaydı (`#11182e`,
`#1d2946`, `#090d16`) ve uygulama "koyu" değil "mavi" görünüyordu.

**Uygulandı (2026-09-06):**

```
screenBg     #090d16 → #121214
cardBg       #11182e → #1c1c1f
cardBorder   #1d2946 → #2e2e33
divider      #1c2742 → #2e2e33
body/muted   slate-300/400 → zinc-300/400
iconColor    #94a3b8 → #a1a1aa
```

İlk denemede zemin fazla koyu kaçtı ve bileşenler seçilmiyordu; değerler bir tık
açıldı (yukarıdaki son hâl). Açık temadaki ilişki korunuyor: **kart zeminden açık,
giriş alanı karttan koyu** (`#141417`). Alt menü de zeminden ayrılsın diye
`rgba(38,38,43) → rgba(32,32,37)` aralığında.

Ayrıca `SimulationScreen`, `BrainExercisesScreen`, `TextField`, `Segmented`,
`RoundButton` ve `ActionButton` içindeki gömülü lacivertler nötrlendi.
`ActionButton`'ın soft varyantı sabit indigo yerine artık `toneSoft(tone)`
kullanıyor — ton neyse zemini o.

**Dokunulmayanlar:** `toneSoft`'un mavi/mor/yeşil/amber/rose kutuları ve günlük
pratikteki "tamamlandı" yeşili. Bunlar açık temadaki `bg-blue-50` vb.
karşılıkları — vurgu, yüzey değil.

---

## Verildi · Sunucu adresi koda gömülmez

**Karar:** `DEFAULT_API_BASE_URL` boş. Adres Ayarlar'dan giriliyor.

**Neden:** Gömülü olan `192.168.1.53:3000` yalnızca tek bir makinenin yerel
ağında çalışıyordu; başka herkeste uygulama sessizce bozuk açılıyordu.

---

## Verildi · Bildirim planlaması tek yönlü

**Karar:** Ayarlar kaynak, planlanmış bildirimler türev. `syncReminders()` önce
**yalnızca kendi** kimliklerimizi iptal ediyor, sonra baştan kuruyor.

**Neden:** İki yönlü eşitleme (planlanmışı okuyup ayarla karşılaştırma) her
kenar durumda ayrışıyordu. Tek yön hem basit hem de kullanıcının uygulama dışı
bildirimlerine dokunmuyor.

**Bağlı kurallar:**
- İzin, kullanıcı ana şalteri **açtığında** isteniyor — açılışta değil.
- `Device.isDevice` false ise `'unsupported'` dönüyor ve ayrı mesaj gösteriliyor;
  sessizce başarısız olmuyor.
- Bir modülün bildirimi ancak `notificationsEnabled && module.enabled &&
  module.reminder` üçü birden doğruysa kuruluyor (`reminderActive`).
- Bildirim metni o günün içeriğinden üretiliyor, böylece bildirimle ekran tutuyor.
  ⚠️ **Sınırı (2026-09-11'de fark edildi):** günlük tekrarlayan (`DAILY`)
  bildirimin içeriği kurulduğu anda sabitleniyor ve yalnızca uygulama açılınca
  yeniden kuruluyor. Uygulama birkaç gün açılmazsa diyafram / konuşma / belagat /
  günün metni bildirimleri eski günün içeriğini gösterir. Lugat bu yüzden belirli
  kelime yazmıyor; diğer modüller için çözüm (tarihli tek seferlik bildirimler ya
  da genel metin) henüz seçilmedi.

**Kimlik önekleri kozmetik.** `cancelAllReminders()` planlanmış bildirimleri
kimlik dizesine göre değil `data.kind === 'daily-practice'` alanına göre
süzüyor. Bu yüzden önek `savunma.daily.*` → `terakki.daily.*` yeniden
adlandırması (2026-09-07) hiçbir geçiş planı gerektirmedi.

### Ek karar (2026-09-13): bildirim bütçesi paylaştırılıyor

**Karar:** Bekleyen bildirim sayısı tek bir tavanla yönetiliyor
(`NOTIFICATION_BUDGET = 56`, iOS'un 64 sınırının altında pay bırakarak). Önce
günlük pratik kuruluyor (`DAILY_PRACTICE_RESERVE = 28`, modül başına
`max(2, min(14, 28 / açık modül))`), **kalan** bütçe aralıklı hatırlatıcılara
gidiyor. Sıra `useReminderSync`'te sabit.

**Neden:** "2 günde 1" modunda modül başına 14 bildirim kuruluyordu; beş modül
açıkken 70 bekleyen bildirim ediyor ve iOS sınırı aşınca **en eskileri sessizce
düşürüyor** — yani hatırlatmalar hata vermeden kayboluyordu. Tek tavan olmadan
her yeni bildirim türü (4b serbest alarmlar) aynı sessiz kaybı büyütürdü.

**Bağlı kurallar:**
- Her tür kendi `data.kind` değeriyle süzülüp iptal ediliyor; türler birbirinin
  bildirimini silmiyor (`daily-practice`, `habit-reminder`, sırada
  `personal-reminder`).
- Bütçeye sığmayan bildirim sayısı gizlenmiyor; hatırlatıcılar arasında
  **sırayla** paylaştırılıyor ki biri hepsini yemesin (`habitPlan.ts`).
- Sayaçlar bildirim planını tetiklemiyor: `habitReminders.ts` sayaçları ayrı
  alanda tutuyor, `useReminderSync` yalnızca `reminders` alanını izliyor. Aksi
  hâlde her "+1" bütün bildirimleri iptal edip yeniden kurardı.

### Ek karar (2026-09-13): serbest alarmlar tekrarlayan tetikleyici kullanıyor

**Karar:** Serbest alarmlar (Bölüm 4b) tek tek tarihli bildirimlerle değil,
tekrarlayan tetikleyicilerle kuruluyor: her gün çalan alarm **1 adet `DAILY`**,
gün seçilmiş alarm **gün başına 1 adet `WEEKLY`**. Sıra: günlük pratik →
alarmlar → aralıklı hatırlatıcılar.

**Neden:** Aralıklı hatırlatıcılar (4a) tarihli bildirim kurmak zorunda, çünkü
"09:00-22:00 arası her saat" kuralını hiçbir tekrarlayan tetikleyici tutamıyor.
Alarmda böyle bir aralık yok — sabit saat, sabit gün. Yukarıdaki DAILY içerik
bayatlama sınırı da alarmları bağlamıyor: metin günün içeriğinden üretilmiyor,
kullanıcının yazdığı etiket. Sonuç: alarm başına 1-7 bekleyen bildirim, kayan
pencere yok, uygulama açılmasa da alarm çalmaya devam ediyor.

**Alarmlar aralıklı hatırlatıcılardan önce kuruluyor,** çünkü kullanıcı onları
bilerek kurdu; aralıklı hatırlatıcılar ise ambiyans ve zaten kırpılmaya uygun.

**Bütçeye sığmayan alarm kısmen kurulmuyor.** Haftanın üç günü çalıp iki günü
sessiz kalan bir alarm, hiç çalmayan alarmdan daha kötü — kullanıcı ona güvenir.
Sığmayan alarm bütünüyle atlanıyor ve kimliği `skippedForBudget` ile ekrana
taşınıyor.

**Android kanalı ayrı** (`personal-reminders`) ve önem derecesi **HIGH**:
ilaç/uyanış gibi kaçırılmaması gereken hatırlatmalar. Günlük pratik ve aralıklı
hatırlatıcılar DEFAULT'ta kalıyor.

---

## Verildi · Kişiye özel içerik diğer uygulamalara taşınmaz

**Karar:** Dinî içerik modunun kartları — **günün duası** ve **günün Risale-i
Nur vecizesi** (`src/data/risale.ts`, `DailyVecizeCard`) — Terakki'ye özeldir.
**İrtifa'ya eklenmeyecek**; **Fesahat için karar açık bırakıldı** ("belki",
koşulları `YAPILACAKLAR_FESAHAT.md`'de).

**Neden:** Üç uygulama ortak bir gövdeden ayrılıyor ve kod taşınırken "hazır
varken alalım" refleksi kapsamı bozuyor. İrtifa kurumsal mülakat hazırlığı;
orada dinî içerik kapsam dışı. Fesahat'ın ekseni ise dil ve okuma — oraya
uyarlanacaksa havuz tek bir esere değil geniş bir vecize/aforizma birikimine
dayanmalı ve dinî şaltere değil genel bir "günün sözü" ayarına bağlanmalı.

**Bağlı kural:** Bu içerikler `religiousMode` şalterine bağlı; şalter kapalıyken
hiçbir yerde görünmüyorlar.

⚠️ **Metin doğrulaması açık:** Vecize listesi yaygın dolaşan metinlerden
kuruldu; **birebir lafız ve künye asıl eserden doğrulanmadı**. Doğrulanana
kadar liste kısa tutuluyor — sayı artırmak yerine doğruluk korunuyor.

---

## Verildi · Ölçüm skalası norm uydurmaz

**Karar:** Ölçümden sonra gösterilen "ben neredeyim" çubuğu iki türlü
(`MeasureScale`):

- **`reference`** — savunulabilir bir tipik aralığı (dinlenik solunum hızı
  12-20, sesli okuma 120-150 kelime/dk) ya da doğal sınırları (0-5 öz-kontrol,
  %0-100 sınav) olan ölçümlerde.
- **`personal`** — genel normu OLMAYAN ölçümlerde (nefes tutma, kontrol
  duraklaması, tek nefeste sayma, kontrollü veriş, nefes/metin). Bunlarda skala
  kişinin **kendi** ölçüm aralığıdır; iki ölçümden önce hiç gösterilmez.

**Neden:** Kullanıcı "nerede olduğunu" görmek istiyor, ama bunun için norm icat
etmek Bölüm 5'teki ölçüm dürüstlüğü kuralını çiğnerdi. Nefes tutmada bir
"hedef" göstermek doğrudan zararlı: hedef gören kişi zorlar. Kontrol
duraklamasında dolaşan eşiklerin (BOLT vb.) kanıtı zayıf, tekrar edilmiyor.
Dolgu kelime bantları ise kaba bir yol gösterici ve ekranda **nüfus normu
olmadığı açıkça yazıyor**.

---

## Verildi · Splash başlığı görsel olarak üretiliyor (2026-09-18)

**Karar:** `SplashOverlay`'deki "Terakki" yazısı canlı metin değil, hazır bir
görsel: `assets/brand/wordmark-terakki.png`. Üreteci
`tools/icon-forge/build_wordmark.py`, kaynağı yine Italianno fontu — harfler
fontun kendi eğrilerinden çiziliyor, şekillendirme (shaping) devreye girmiyor.

**Yan kazanç:** Splash artık font yüklenmesini beklemiyor; `useFonts` ve
`FONT_TIMEOUT` kalktı, native ekrandan JS katmanına geçiş erkene alındı.

**Font yerinde kalıyor** (`assets/fonts/Italianno-Regular.ttf` + OFL metni):
görsel ondan türetilmiş bir eser, lisans bildirimi saklanmalı.

**Neden:** Italianno'da 'i'nin **noktası, harfin ilerleme genişliğinin dışında
duruyor**. Glif 77'nin konturları ölçüldü: gövde x=32..247, nokta x=218..278;
harfin ilerleme genişliği ise 192. Nokta bir sonraki harfin alanına taşıyor —
kaligrafik fontlarda olağan. "Terakki"de 'i' son harf olduğu için metin kutusu
son ilerleme genişliğinde bitiyor ve nokta kutunun dışında kalıp kırpılıyordu;
ekranda **"Terakkı"** görünüyordu (cihaz ekran görüntüsüyle saptandı).

Ölçü: taşma 86 birim = 5.16 px (fontSize 60); NBSP 169 birim = 10.14 px pay
veriyor. İki yana konuyor ki yazı ortalı kalsın. Sıradan boşluk değil NBSP:
Android satır sonundaki normal boşluğu genişlik hesabından düşürebiliyor.

**Elenen açıklamalar** (aynı yer ikinci kez kazılmasın — üçü de ölçülerek
çürütüldü):

- **`locl` / Türkçe yerelleştirme değil.** Fontta `latn`→`TRK ` dil sistemi ve
  `locl` özelliği var, ama cihazın dili **en-US**; ayrıca TRK'nin verdiği glif
  (691) bileşik ve nokta bileşeni taşıyor, yani noktalı.
- **`ccmp` değil.** Noktayı düşüren lookup'ları (3, 4) çağıran zincirin koşulu
  çözüldü: yalnızca 'i'den **sonra birleşen bir aksan** gelirse tetikleniyor
  ("i + ´" → noktasız i + ´). Standart ve doğru davranış; "Terakki"de aksan yok.
- **`init` / `fina` değil.** Bu özelliklerin verdiği glifler (688, 689) zaten
  noktalı (2 kontur, yMax 436).

**Denenip işe yaramayan çözümler** (üçü de cihazda denendi, üçü de çözmedi):

1. Araya **ZWNJ** (U+200C) koymak — sorun şekillendirme/ikame olmadığı için etkisiz.
2. Son harfi **ayrı bir `Text`**'e almak — durumu kötüleştiriyor: tek başına kutu
   192 birim, nokta 218'de başlıyor, tamamen dışarıda kalıyor.
3. İki yana **NBSP** koymak — ölçüye göre yetmeliydi (nokta 86 birim taşıyor,
   NBSP 169 birim pay veriyor) ama ekranda nokta yine çıkmadı. Android'in metin
   kutusunu tam olarak neye göre kırptığı aydınlatılamadı; bu yüzden yazı canlı
   metin olmaktan çıkarıldı.

---

## Verildi · Native açılış ekranı düz renk kalıyor

**Karar:** Android'in native açılış ekranı düz `#0A8D65` zemin + beyaz figür
olarak kalıyor; degrade ve "Terakki" yazısı yalnızca JS katmanında
(`SplashOverlay`) gösteriliyor.

**Neden:** Android 12+ açılış ekranı API'si zemin için **yalnızca tek bir renk**
kabul ediyor; degrade verilemiyor. Bu yüzden ilk kare kaçınılmaz olarak düz
renk.

**Ölçüldü (2026-09-13):** Bu "eski görünen" ilk ekran **bayat varlık değil** —
native zemin tam olarak `#0A8D65`, figür `assets/icon.png`'deki güncel marka
figürünün aynısı ve native ile JS katmanındaki figür **1 piksel farkla** aynı
yerde/aynı boyutta. Yani geçişte sıçrama yok, tek fark degrade ve yazı.

Geliştirme derlemesinde düz ekranın 4-5 saniye durmasının sebebi Metro'nun JS
paketini yüklemesi; sürüm derlemesinde bu süre kısadır. Ölçülmesi
"Cihazda doğrulanacaklar" listesine yazıldı.

---

## Verildi · Karne ayrı ekranda (Bölüm 5)

**Karar (2026-09-12, kullanıcı):** Ölçümlerin listesi (karne) İlerleme sekmesinin
içinde değil, **ayrı bir ekranda** (`MeasurementsScreen`); İlerleme'den bir
düğmeyle açılır.

**Neden:** İlerleme bir **özet** sayfası — seriler, kariyer/zihin kutuları,
geçmiş kısayolları, gelişim eğrisi. On testi (her biri başlık + son değer + eğri
+ "Ölç" düğmesi) aynı sayfaya koymak özeti uzun bir listeye çeviriyordu.

**Bu, bölümün ilk kararını tersine çeviriyor.** Bölüm 5 "ayrı bir `TestsScreen`
yazmaya gerek yok" diyordu; o karar karnenin küçük kalacağı varsayımına
dayanıyordu, test sayısı 3'ten 10'a çıkınca geçerliliğini yitirdi. `Sparkline`
kararı hâlâ geçerli: ayrı bir grafik bileşeni yazılmadı, `TrendChart` yetiyor.

**Sınırı:** ölçümün kendisi karnede yapılmaz. Her test kendi modül ekranında
ölçülür (nefes testleri Diyafram → Ölçüm, okuma Günün Metni, dolgu oranı
Konuşma, kelime seviyesi Dil & İfade); karnedeki "Ölç" düğmesi yalnızca o ekranı
doğru sekmesiyle açar. Böylece ölçüm, yapıldığı pratiğin bağlamında kalıyor.

---

## Verildi · SQLite'a geçiş aşamalı (Bölüm 0.4)

**Karar (2026-09-11):** `expo-sqlite`'a geçiş üç aşamada yapılıyor: (1) kalıcılık
katmanının arka ucu, (2) geçmiş ve test sonuçları için ilişkisel tablolar,
(3) katalog tabloları + FTS5. Plan tablosu YAPILACAKLAR Bölüm 0.4'te.

**Neden aşamalı:** Buradaki veri gerçek kullanıcı verisi — profil, seriler,
ayarlar, öğrenilen kelimeler, geçmiş. Spec'teki tablo şemasına tek seferde
geçmek dokuz depoyu ve onlarca ekranı aynı anda değiştirip veri taşımayı en
riskli hâliyle yapmak demekti. Aşama 1'de dış API (`readJson` / `writeJson`)
aynı kaldığı için depo ve ekran kodu değişmiyor; hata yalnızca `storage.ts` ve
`db.native.ts`'te olabilir.

**Aşama 1 kuralları:**
- **Senkron API.** Depolar ilk değerlerini modül yüklenirken senkron okuyor;
  `openDatabaseSync` / `getFirstSync` / `withTransactionSync` bu yapıyı koruyor.
- **Aktarım bir kez ve bölünmez.** `savunma-store/` altındaki bütün `*.json`
  dosyaları (sabit liste değil) tek transaction'da `kv` tablosuna. Bozuk JSON
  atlanır; veritabanında olan anahtarın üstüne yazılmaz. Hata olursa geri alınır
  ve o oturum dosyalarla devam eder — yarım aktarım yok.
- **JSON dosyaları silinmiyor.** Aşama 1 cihazda doğrulanıp birkaç sürüm geçene
  kadar yedek.
- **Native modül yoksa çökme yok.** `expo-sqlite` geç ve korumalı yükleniyor;
  yeniden derlenmemiş bir geliştirme derlemesinde dosya depolamasına düşülüyor.
  Web paketine SQLite hiç girmiyor (`db.ts` / `db.native.ts` ayrımı).
- **Yazma hatası veri silmiyor.** Transaction başarısızsa bekleyen yazımlar
  korunur, sonraki flush'ta yeniden denenir. (Dosya yolunda eskiden hata olsa da
  bekleyenler siliniyordu.)
- Ayrı `settings` tablosu yok: ayarlar zaten `kv`'de birer anahtar.

**Bilinen sınır:** Aktarım yapıldıktan sonra bir oturumda veritabanı açılamaz ve
dosyalara düşülürse, o oturumun yazımları sonraki açılışta veritabanındaki daha
eski değerin gerisinde kalır. Aynı derlemede native modül bir açılışta var bir
açılışta yok olmayacağı için olasılığı düşük; kabul edildi.

**Yan sonuç:** DEVAM.md'deki "`STORE_DIR` hâlâ `savunma-store`" izi ayrı bir
klasör göçü gerekmeden kapanıyor — veri `terakki.db`'ye taşınıyor, eski klasör
yalnızca yedek olarak kalıyor.

### Aşama 2 kapsamı (2026-09-11)

- **Yalnızca büyüyen iki veri seti tabloya geçiyor:** mülakat oturumları
  (`interview_sessions`) ve egzersiz kayıtları (`exercise_logs`). İkisinin de
  üst sınırı yok; tamamlanan her oturum bir kayıt ekliyor.
- **Test sonuçları taşınmıyor.** `daily-practice-progress.tests` test başına
  100 kayıtla sınırlı (`MAX_TEST_RESULTS`), büyümüyor. Taşımak
  `useDailyProgress`'in dönüş şeklini ve saf fonksiyonları değiştirip ölçüm
  ekranlarına dokunmayı gerektiriyordu; kazancı yok, riski var.
- **Karma şema:** her tabloda sorgulanacak birkaç sütun (`created_at`, puan /
  kategori / efor / süre) + kaydın tamamı `data` sütununda JSON. Kayıt tipine
  alan eklendiğinde şema göçü gerekmiyor.
- **Sorgular ihtiyaçla birlikte.** Spec'teki tarih aralığı / ortalama /
  `GROUP BY` sorgularına bugün hiçbir ekran ihtiyaç duymuyor (istatistikler
  bellekteki diziden hesaplanıyor). Ölü kod yazılmadı; Bölüm 5 ekranlarıyla
  birlikte eklenecek.
- **Göç aşama 1'i bozmaz.** Tablo göçü ayrı ve bölünmez; başarısız olursa
  yalnızca bu iki depo o oturumda eski `kv` kaydıyla çalışır, `kv` arka ucu
  kapanmaz. Eski `kv` kayıtları yedek olarak kalır.
- **Yazma hatası veri silmez.** Tek satırlık yazım başarısız olursa depo "kirli"
  işaretlenir; sonraki değişiklikte ya da uygulama arka plana geçerken bellekteki
  liste tek transaction'da tabloya yeniden yazılır.

---

## Verildi · İlk açılış oryantasyonu (Bölüm 0.1)

**Karar (2026-09-11):** İlk açılışta kısa bir akış: hoş geldin → hedefler (1-3)
→ günlük süre → hatırlatma saati → 30-60 sn ısınma → bitiş. YAPILACAKLAR
Bölüm 0.1'deki spec'ten şu noktalarda sapıldı:

- **Ayrı depo.** Hedefler ve oryantasyon durumu `dailyPracticeSettings`'e değil
  `onboarding` deposuna (`src/utils/onboarding.ts`) yazılıyor. **Neden:** o dosya
  modül ayarlarını tutuyor; "kullanıcı neyi hedefliyor" bir modül ayarı değil.
- **Eski kullanıcı atlanır.** Serisi, öğrenilmiş kelimesi, mülakat/egzersiz
  geçmişi ya da profil adı olan biri oryantasyonu görmez. Karar ilk açılışta
  bir kez verilip **hemen kaydedilir**. **Neden:** kaydedilmeseydi akışı yarıda
  bırakan yeni biri (ısınmada kelime öğrenip çıkan) bir sonraki açılışta eski
  kullanıcı sayılır, akışı hiç bitirmezdi.
- **Isınma seriye sayılmaz.** Spec "1 Günlük Seri Başladı!" diyordu. 30 saniyelik
  ısınmayı günlük pratik gibi saymak seriyi anlamsızlaştırır (bkz. "Modüller
  abartılı vaat vermez"). Bitişte "İlk adımını attın" yazar. Isınmada gerçek bir
  eylem olursa — günün kelimesine "Öğrendim" — o normal yoldan kaydedilir.
- **Ad sorulmaz.** "Kullanıcıdan içerik yazması istenmez" kararı gereği; profil
  adı isteğe bağlı olarak Profil'de kalır.
- **Hedef modül kapatmaz, sıralar.** Seçilmeyen alanlar kaybolmaz; seçilenler
  Bugün listesinde ve Gelişim'de öne alınır. **Neden:** ilk dakikada verilen
  seçim kullanıcıyı uygulamanın geri kalanından koparmamalı.
- **Hatırlatma izni yalnızca saat seçilirse istenir** ("Bildirim planlaması tek
  yönlü" kararındaki "izin açılışta istenmez" kuralıyla uyumlu). Seçilen saat,
  hedeflerin günlük pratik modüllerinin hatırlatma saati olur.
- **Her adımda "Atla".**
- **İpucu balonları ertelendi.** İlk sürümde Bugün'de tek, kapatılabilir bir
  "hızlı tur" kartı; sekmelere işaret eden konumlu balonlar sonraki sürüm.

---

## Verildi · Dil & İfade'nin odağı lugat ve Türkçe

**Karar (2026-09-11):** "Dil & İfade" sütununun ana ekseni **lugat (kelime
hazinesi) ve Türkçeyi daha iyi anlama/doğru kullanma**; söz sanatları
(belagat) ikincil / ileri düzey bir bölüm olarak kalır.

**Neden:** Sütunün içeriği zamanla belagate (söz sanatlarına) kaymıştı; oysa
alanın amacı kelime öğrenmek, lugat geliştirmek, Türkçeyi daha iyi anlamak ve
doğru kullanmak.

**Sonuçları:**
- Gelişim'deki "Dil & İfade" kartı yeni `LanguageScreen`'e açılır.
- Belagat ekranı silinmez; ileri düzey/ikincil bölüm olarak kalır.
- Belagat günlük pratik modülü şimdilik olduğu gibi yerinde duruyor.
- ~~Lugat henüz günlük pratik modülü değil.~~ Aynı gün değişti — aşağıdaki ek karar.

**İçerik kuralı:** anlam ve köken TDK Güncel Türkçe Sözlük ile doğrulanır;
örnek cümleler özgün yazılır.

### Ek karar (2026-09-11): lugat günlük pratik modülü

**Karar:** Kullanıcı "günün metni gibi günlük kelime de olsun, ana ekranda da
olsun" dedi. Lugat, günün metniyle aynı düzeyde bir günlük pratik modülü
(`lugat`) oldu: aç/kapa, hatırlatma + saat, seri, Bugün listesi, İlerleme.

**Kurallar:**
- **Tamamlanma:** bugünün kelimelerinin hepsi "Öğrendim" olarak işaretlenince
  gün tamamlanır ve seriye sayılır. Mantık tek yerde (`lugatProgress.markLearned`);
  ekranlar ayrı kural yazmaz.
- **Yeni kelime önceliği:** önceki günlerde öğrenilen kelimeler günün listesine
  girmez. Bugün öğrenilenler listeden **çıkmaz** — yoksa her "Öğrendim"de liste
  değişir, deterministik seçim kuralı (aynı gün aynı içerik) bozulurdu.
- **Tekrar günü:** seviyede yeni kelime kalmadıysa liste tekrardır; "Öğrendim"
  düğmeleri zaten dolu olacağı için ayrı bir "Tekrarı tamamladım" eylemiyle seri
  işaretlenir.
- **Ana ekran:** Günlük Pratik listesinde satır + bugünün ilk öğrenilmemiş
  kelimesini gösteren "Günün Kelimesi" kartı. Kart `lugat.showOnHome` ile
  kapatılabilir (günün metnindeki `showOnHome` gibi); satır modül açıkken hep var.
- **Bildirim metni belirli bir kelime içermez.** Günlük tekrarlayan bildirimin
  içeriği kurulduğu gün sabitleniyor; uygulama birkaç gün açılmazsa eski günün
  kelimesini gösterirdi.
- Günlük kelime sayısı ve seviye tercihi `lugatProgress`'te kalıyor; modül
  ayarları (aç/kapa, hatırlatma) `dailyPracticeSettings`'te. Gelişim'deki
  Dil & İfade kartının görünürlüğü `lugat.enabled`'a bağlı.

**Yol üstünde bulunan hata:** `useDailyProgress` her ekranda ayrı yerel state
tutuyordu; Bugün / İlerleme / Profil sekmeleri açık kaldığı için başka ekranda
tamamlanan modülün ✓'i ve serisi uygulama yeniden başlayana kadar
güncellenmiyordu. İlerleme verisi paylaşılan depoya (`createPersistentStore`)
taşındı.

---

## Verildi · Belagat müfredatı klasik tasnife göre kuruldu

> **Not (2026-09-11):** Bu karar, "Dil & İfade"nin odağının lugat ve Türkçeye
> kaymasıyla ikincil/ileri düzey konuma geçti — bkz. yukarıdaki karar.

**Karar:** Modül, belâgatın klasik üç kolunu izliyor ve önkoşulu olan fesahati
diksiyon tarafına bağlıyor.

- **Meânî** — sözün hâlin gereğine (*muktezâ-yı hâl*) uygunluğu: îcâz, itnâb,
  takdîm-tehîr, kasr, hazif, fasl-vasl, inşâî üslup.
- **Beyân** — aynı manayı farklı yollarla anlatma: teşbih, teşbîh-i belîğ,
  istiare, mecâz-ı mürsel, kinaye, ta'rîz, teşhis-intak.
- **Bedî'** — lafzın ve mananın süslenmesi: cinas, seci, tıbâk, mukabele,
  hüsn-i ta'lîl, tecâhül-i ârif, mübalağa, tevriye, telmih, irsâl-i mesel,
  tekrîr, aliterasyon.

**Neden fesahat diksiyona bağlı:** Fesahat kusurları (*tenâfür-i hurûf*,
*garâbet*, *ta'kîd*, *kesret-i tekrar*, *za'f-ı te'lîf*) doğrudan telaffuz ve
akıcılık sorunları. Bu yüzden konuşma egzersizi ekranı her gün bir fesahat
kusuru gösteriyor (kusurlu → düzeltilmiş), belagat ekranı ise üç aşamalı
ilerliyor: **öğren → tanı → üret**.

**Bağlı tasarım kuralları:**
- Her sanatın `interviewUse` alanı var — müfredat mülakat pratiğine bağlı.
- Okuma metinleri içerdikleri sanatların id'leriyle etiketli (`belagatArtIds`);
  metni sesli okumak aynı zamanda sanat tanımaya dönüşüyor.
- Günlük seçim `dayIndex` üzerinden **deterministik**: gün içinde uygulama kaç
  kez açılırsa açılsın aynı sanat, aynı metin, aynı egzersiz geliyor.
- Telif: yalnızca kamu malı metinler (Yunus Emre, Fuzûlî, Şeyh Gâlib, Ziya Paşa,
  Kadı Burhaneddin, Nedîm, Mehmet Âkif Ersoy, Atatürk) ve kısa meal/hadis
  aktarımları.

**Kaynaklar:**
- [BELÂGAT — TDV İslâm Ansiklopedisi](https://islamansiklopedisi.org.tr/belagat)
- [BEDÎ' — TDV İslâm Ansiklopedisi](https://islamansiklopedisi.org.tr/bedi--belagat)
- [Belâgatta Meânî İlmi (DergiPark)](https://dergipark.org.tr/tr/download/article-file/543080)
- ["Teşbîh" ve "İstiâre"nin Belâgat Kitaplarındaki Görünümü](https://www.researchgate.net/publication/279171941_Tesbih_ve_Istiarenin_Belagat_Kitaplarindaki_Gorunumu_Uzerine)
- [Nefes Egzersizleri — Diyafram Nefesi (TRT Akademi)](https://www.trtakademi.com/tr/blog/nefes-egzersizleri-diyafram-nefesi-27)
- [Diksiyon Dersleri İçin Nefes Egzersizleri](https://sinemaakademi.com.tr/diksiyon/diksiyon-dersleri-icin-nefes-egzersizleri)

---

## Açık · İki tasarım sistemi birleşecek mi

`src/components/AppUI.tsx` (623 satır) ile `src/components/practice/PracticeUI.tsx`
(295 satır) örtüşen bileşenler taşıyor: `AppScreen`/`ScreenShell`,
`Surface`/`Card`, `ActionButton`/`PrimaryButton`, `SectionLabel`/`SectionTitle`.
16 ekranın 13'ü ikisini birden import ediyor. Renk kaynağı ortak
(`themeTokens`), sorun bileşen ikiliğinde.

Birleştirme 16 ekranda import değişikliği demek — riskli, ayrı bir turda
yapılmalı. Karar: **henüz verilmedi.**

---

## Verildi · Bildirim şalteri hiyerarşisi

**Soru neydi:** `appSettings.reminderFrequency` (`off`/`daily`/`everyOtherDay`)
ile `dailyPracticeSettings.notificationsEnabled` + modül başına `reminder` aynı
konuyu iki yerden yönetiyor. Kullanıcı sıklığı "Kapalı" yaptığında modül
anahtarları ne olacaktı?

**Cevap (2026-09-08):** Karar aslında kodda çoktan verilmiş, yalnızca yazıya
geçmemişti. Okunup doğrulandı:

- `notificationsEnabled` **ana şalter**. Kapalıyken hiçbir modül bildirim kurmaz
  (`reminderActive = notificationsEnabled && module.enabled && module.reminder`).
- Sıklık "Kapalı" seçildiğinde `changeFrequency` yalnızca ana şalteri kapatıyor;
  **modül `reminder` bayraklarına dokunmuyor.** Yani tercihler korunuyor ve
  bildirimler yeniden açıldığında aynen geri geliyor.
- Ekranda görünen sıklık türetilmiş bir değer: ana şalter kapalıysa "Kapalı"
  gösteriliyor, açıksa `reminderFrequency` gösteriliyor (`'off'` ise "Günlük"e
  düşüyor).

Bu davranış doğru; kalıcı hâle getirildi.

### ⚠️ Kalan pürüz: iki kaynak

Aynı gerçeği iki alan tutuyor ve tutarsız kalabiliyorlar. Örnek: sıklık "Kapalı"
iken günlük pratik bölümündeki ana şalter açılırsa `notificationsEnabled = true`
olur ama `reminderFrequency` `'off'` kalır. Ekran "Günlük" gösterir, davranış da
günlüktür — yani **kullanıcıya yansıyan bir hata yok**, çünkü türetme bunu
örtüyor. Ama depolanan değer ekranla çelişiyor.

Temizliği: `reminderFrequency`'den `'off'` seçeneğini kaldırıp sıklığı yalnızca
`daily`/`everyOtherDay` yapmak, açık/kapalıyı tek başına `notificationsEnabled`e
bırakmak. Küçük iş, davranış değişmiyor — Bölüm 00 turunda yapılabilir.

**2026-09-11:** Modül panelindeki ve Hatırlatıcılar ekranındaki yeni ana şalter
(`NotificationsMainToggle`) iki alanı birlikte güncelliyor — açılınca sıklık
`'off'` ise `'daily'`, kapatılınca `'off'`. Çelişki bu yoldan artık oluşmuyor;
yukarıdaki temizlik yine de geçerli (iki kaynak hâlâ var).

---

## Verildi · Kullanıcı karar turu (2026-09-19)

YAPILACAKLAR'daki açık sorular kullanıcıya soruldu. Cevaplar:

| Konu | Karar |
| --- | --- |
| **Uygulama ikonu** | Teslim edilen 3 duraklı degrade (`#0EA876 → #0A8D65 → #077456`) doğru — "ikon iyiydi". Renkler **çok az** daha canlı olabilir, ama çok az. Kaynak SVG bu degradeye eşitlenecek; eski 2 duraklı (`#10B981 → #04614A`) terk edildi. |
| **Katalog sektörleri** | Savunma sanayii + **Yazılım & teknoloji**. Diğerleri (finans, kamu, sektörsüz) şimdilik yok. |
| **Vecize kaynağı** | **Uygulama + sunucu.** Uygulamada "Vecizelerim" listesi (yaz / yapıştır / dosyadan al, düzenle, sil) — ayrı "admin modu" **yok**, çünkü uygulama tek kişilik; telefonu tutan zaten sahibi. Gmail'i `server/server.ts` okur; uygulama sunucuya ulaşınca yeni vecizeleri çekip yerel havuza kaydeder. Sunucu kapalıyken hiçbir şey bozulmaz (sunucusuz %100 çalışma kuralı). Yerel havuz varsayılan kalır. |
| **Nefes ekranı** | Nefesle ilgili **her şey tek "Nefes" çatısı altında** — diyafram programları, nefes kontrolü egzersizleri (büzük dudak, kaburga genişletme, basamaklı alma, MPT, sayarak verme), CO₂ tabloları, Rahat Tutma. Ayrı dağınık girişler yok. |
| **Duruş öz-kontrol ölçümü** | Duruş egzersizlerinin yanında (Dinlenme & Denge → Duruş & Sırt); Karne'deki "Ölç" oraya açar. |
| **Sesli sayım** | Yok; görsel geri sayım yeter. |
| **Oryantasyondaki günlük süre** | Bugün listesini ayarlasın (3 dk → az ve kısa pratik, 10 dk → hepsi; egzersizlerin kendisi kısalmaz). **Ayarlar'dan değiştirilebilsin.** |
| **Alarm** | Şimdilik bildirim yeter. Gerçek (tam saatinde, kapatılana kadar çalan) alarm **ileride eklenecek** — YAPILACAKLAR'da iş olarak duruyor. |
| **Zayıf ses tespiti** | Günün seansını değiştirmez; **öneri** olarak "zayıf seslerine özel seans" düğmesi çıkar. Günlük içerik deterministik kalır. |
| **Su hedefi** | Sabit değil; kullanıcıya boy/kilo/etkinlik gibi bilgiler sorulup **aralık** önerilir. Öneri tıbbi değildir, abartmaz (bkz. "Modüller abartılı vaat vermez"); böbrek/kalp rahatsızlığında hekime danışma notu. Kullanıcı öneriyi değiştirebilir. |
| **"Bugün" sekme ikonu** | Güneş doğuşu (`Sunrise`) kalıyor. |
| **Profil rengi** | Yalnızca profilde (avatar zemini/çerçevesi). |
| **`expo-system-ui`** | Eklenecek (yeniden derleme gerekir). |

### Ek kararlar (2026-09-19, aynı tur)

- **Mola sıklığı önerisi eklenecek.** Metin farkındalık önerisi olarak yazılır
  ("belli aralıklarla kalk, esne"), sağlık iddiası kurulmaz; mevcut "Ayağa
  kalk & esne" hatırlatıcısına bağlanır.
- **Nefes ekranının düzeni:** Pratik · Antrenman · Konuşma Nefesi · Ölçüm ·
  Rehber.
  - Pratik: diyafram programları, sade 5 dk 4-6.
  - Antrenman: kaburga genişletme, büzük dudak, basamaklı alma, Rahat Tutma, CO₂ tabloları.
  - Konuşma Nefesi: tek nefeste "aaa" uzatma (MPT), sayarak verme; Diksiyon
    ekranından buraya kısayol.
  - Diksiyon (artikülasyon, tekerleme, vurgu, tempo, dolgu) ayrı modül olarak
    aynen kalır.
  - Adlandırma: "akciğer genişletme" denmez — akciğeri büyütmez; egzersizin adı
    "kaburga genişletme".
- **Yalnız Zihin ya da Kariyer hedefi seçenin günlük hatırlatması** kendi
  ekranını açar (zihin egzersizleri / mülakat ekranı); "Günün metni"ne
  kurulmaz.

### Ek karar (2026-09-20): ikon degradesi B, eskisi arşivde

Üç aday gösterildi (mevcut / doygunluk %12 / %25). Seçilen **B**:
`#05B179 → #029568 → #007B59` — doygunluk %12 artırıldı, parlaklık ve ton
korundu ("çok az canlı" isteği).

- Kaynak: `assets/brand/ikon/terakki-icon-master.svg`; bütün ikonlar
  `tools/icon-forge/build_from_brand.py` ile bundan üretiliyor. Kaynak ile
  teslim edilen ikon arasındaki ayrışma (bkz. YAPILACAKLAR Bölüm 8) bu turda
  kapandı: önce 3 duraklı eski degrade eşitlenip çıktı commit'teki ikonlarla
  piksel piksel karşılaştırıldı (Android zemininde en büyük fark 1/255),
  sonra B uygulandı.
- **Eski ikonlar silinmedi:** `assets/brand/arsiv/` — `icon-48c91c1-commit.png`
  (teslim edilen eski ikon), `icon-2026-09-19-eski-degrade.png` ve eski kaynak
  SVG.
- Orta durak `#029568` tek nokta değil **dört** yerde geçiyor ve aynı kalmalı:
  `app.json` (adaptiveIcon + splash), `src/components/SplashOverlay.tsx`
  (`NATIVE_BACKGROUND`), iOS `SplashScreenBackground.colorset`.
- `SplashOverlay`'in degradesi bugüne kadar hâlâ iki duraklıydı (`#10B981 →
  #04614A`), yani açılış ekranı ikonla aynı yeşilde değildi; yeni degradeye
  çevrildi.

### Ek karar (2026-09-20): günlük süre yalnızca seçilmişse listeyi kısaltır

`onboarding.dailyMinutes` varsayılanı 5. Bütçe doğrudan bu değere bağlansaydı,
uygulamayı zaten kullanan (oryantasyon görmeyen) biri hiçbir şey seçmeden
Bugün listesinin kısaldığını görürdü. Bu yüzden `dailyMinutesChosen` alanı
eklendi: süre oryantasyonda, Ayarlar'da ya da Profil panelinde **açıkça
seçilene kadar** liste kısalmaz. Eski kayıtlarda alan yok → `false`.

---

## Verildi · Mülakat ses kayıtları cihazda kalıcı saklanır (2026-09-20)

**Karar:** Kamera modunda kaydedilen ses, oturum kaydedildiğinde cihazda
**kalıcı** saklanır: hem normal bitişte (süre dolması ya da "Kaydı Bitir ve
Analiz Et") hem de çıkış uyarısında "Kaydet ve çık" seçildiğinde. "Kaydetmeden
çık" seçildiğinde ses kalıcı klasöre hiç taşınmaz ve geçici dosyası silinir.

**Neden:** Ses daha önce yalnızca `captureBuffer`'da, bellekte tutuluyordu ve
analiz biter bitmez siliniyordu. Sonuç: mülakat yarıda kalırsa hiçbir iz
kalmıyordu, analiz de yalnızca aynı oturumda yapılabiliyordu. Artık (a) yarıda
kalan mülakatın kaydı duruyor, (b) analiz sonradan yapılabiliyor (bellekteki
tampon boşsa `AnalysisScreen` sesi diskten okuyor), (c) kayıt Mülakat
Geçmişi'nden dinlenebiliyor.

**Kasıtlı tasarım — tam yol değil dosya adı:** Geçmiş kaydında yalnızca dosya
adı tutulur (`audioFile`), tam URI değil. iOS'ta uygulamanın veri klasörü yolu
güncellemelerde değişebiliyor; tam URI yazılsaydı her güncellemeden sonra
bütün sesler "kayıp" olurdu. Yol, okunacağı anda `audioStore.audioUri()` ile o
günkü klasöre göre kurulur.

**Kasıtlı tasarım — JSON deposunun dışında:** Ses `storage.ts`'in JSON deposuna
GİRMEZ; megabaytlarca base64 her yazımda tüm bloğu yeniden serileştirirdi.
`audioStore.ts` bir depo değil, ince bir dosya katmanıdır: kayıtlar
`Paths.document/terakki-audio/` altında ham ses dosyası olarak (uzantı
`expo-av`'ın ürettiğine göre, pratikte `.m4a`) durur. Tablo ya da JSON indeks
yoktur; bağ, geçmiş kaydındaki dosya adıdır.

**Bağlı kural — ses kaydın ömrü kayda bağlıdır:** `removeSession` sesi de
siler, `clearSessions` ses klasörünü boşaltır. Mülakat Geçmişi'nde ayrıca
toplam boyut göstergesi ve "Ses kayıtlarını sil" toplu eylemi vardır; bu eylem
sesleri siler, kayıtların kendisini (soru, süre, puan, yazılı cevap) bırakır.
Tek tek satır için ses silme arayüzü yoktur — gerekirse `dropSessionAudio(id)`
hazır.

**Yer ve gizlilik:** Kayıtlar uygulamanın belge klasöründe durur, yani cihaz
yedeklemesine (iOS'ta iCloud Backup) dahil olabilir. Ses yalnızca analiz için
sunucuya gider; bu zaten yapay zekâ şalterine bağlıdır (sunucusuz kullanımda
hiçbir yere gönderilmez).

**Bilinen sınır:** Toplam boyut sınırı ve otomatik temizlik **yok**. Geçmiş
büyüdükçe yer kullanımı kullanıcının elindedir; göstergeyle görünür kılındı,
sınır politikası açık iş olarak YAPILACAKLAR'da duruyor.

---

## Verildi · Yanıt defteri kapsamı; mülakat defterin dışında

**Karar (2026-09-20):** Kullanıcının verdiği yanıtlar tek bir defterde toplanır.
Kapsam: **serbest metin + çoktan seçmeli cevaplar**. Defter ekranı modül modül
ayrılır (Tümü · Belagat · Egzersiz · Lugat · Mülakat). **Mülakat yanıtları
defter deposuna yazılmaz**; defterin mülakat sekmesi doğrudan
`interviewHistory`'yi okur.

**Neden defter:** Yanıtlar ya hiç saklanmıyordu (belagat üretim cümlesi yazılıp
atılıyordu) ya da yalnızca doğru/yanlış **sayacı** tutuluyordu (belagat tanıma,
lugat). "Geçen sefer ne yazmıştım", "hangi soruyu yanlış bilmiştim"
sorularının cevabı yoktu.

**Neden mülakat dışarıda:** Mülakatın kendi deposu (`interviewHistory`) aynı
yanıtın yanında kurumu, süreyi, ses dosyasını ve yapay zekâ analizini de
tutuyor. Aynı yanıtı iki yere yazmak iki ayrı doğruluk kaynağı demek olurdu:
biri silinince ya da güncellenince diğeri geride kalırdı. Defter, o kaynağı
kopyalamak yerine gösteriyor.

**Kapsanan yerler:**
- **Belagat** — üretim cümlesi (`ProductionTab`) ve tanıma quizi (`RecognitionTab`).
- **Egzersiz** — `ExerciseEngineScreen`'deki yazı yanıtları; "Kontrol Et" ile,
  öz-değerlendirmeyle ya da süre dolarken otomatik olarak kaydedilir.
- **Lugat** — üç quiz akışı: anlam testi, boşluk doldurma, seviye tespiti.
- **Mülakat** — yazılmaz, `interviewHistory`'den okunur.

**Teknik:** `src/utils/responseHistory.ts`, `createCollectionStore` üzerine
kurulu (`interviewHistory` / `exerciseHistory` ile aynı desen): native'de
`practice_responses` tablosu (şema v3), değilse `response-history` anahtarı
altında JSON blok. `correct` alanı **opsiyoneldir**: belagat üretimi gibi tek
doğrusu olmayan alıştırmalarda tanımsız kalır ve defterde hiçbir doğru/yanlış
damgası gösterilmez.

**Bilinen sınır:** Kayıt sayısı sınırı yok; quiz cevapları hızlı birikir.
Defterde tek tek silme var, sayfalama var (ilk 50 + "daha fazla"), ama otomatik
budama yok — açık iş olarak YAPILACAKLAR'da.

---

## Verildi · Egzersizde otomatik kontrol ile öz-değerlendirmenin ayrımı

**Karar (2026-09-20):** Egzersiz motorundaki cevaplı sorularda kullanıcı
cevabını yazar. `PromptEngine.prompts` öğesi `accept?: string[]` alanı taşır:
**varsa** yanıt otomatik kontrol edilir (doğru/yanlış kartı), **yoksa** cevap
gösterilip kullanıcı kendisi işaretler ("Doğru bildim" / "Bilemedim").

**İlke — tek doğru yazımı olmayan soruya `accept` yazılmaz.** Otomatik kontrol
ancak cevabın çekirdeği tek ve yazımı öngörülebilirse kurulur: bir sayı, bir
yön, bir sıralama. Cevap serbest ifadeyse otomatik kontrol kurmak, doğru
düşünen kullanıcıya "yanlış" damgası vurur — bu, alıştırmanın kendisinden daha
çok zarar verir. Beş egzersizin 32 sorusu tek tek geçildi; 30'una `accept`
yazıldı, ikisi kasıtlı olarak öz-değerlendirmede bırakıldı:
- *Mekansal Kurgu* — "'L' harfini 90° döndürünce ne çıkar": cevap bir şeklin
  tarifi, tek bir doğru cümlesi yok.
- *Konum Sıralama* — "B çökerse hangi servisler etkilenir": cevap iki ayrı
  önerme içeriyor, yazımı kişiden kişiye değişir.

**Karşılaştırma nasıl yapılır** (`src/utils/text.ts` → `answersMatch`): normalize
edilmiş **tam eşitlik** aranır. Sırayla üç deneme: (1) noktalama/ayraç temizlenmiş
ve Türkçeye duyarlı küçük harfe çevrilmiş eşitlik, (2) Türkçe harfler ASCII'ye
indirgenmiş eşitlik — Türkçe klavye kullanmayan kullanıcı "bati" yazınca haksız
yere yanlış saymamak için, (3) sayısal eşitlik — "1.200" ile "1200" aynı sayılsın
diye. `includes` **kullanılmaz**: "13" girdisi "113" cevabını doğrulardı. Kelime
sırası ve eksik kelime hoş görülmez; yalnızca yazım varyasyonu karşılanır.

**Efor puanının tanımı değişmedi.** `ExerciseLog.effort` hâlâ tamamlanan adım
oranıdır; geçmişteki trend grafiği onu okuyor. Doğruluk ayrı taşınır
(`correctCount` / `checkedCount`, ikisi de opsiyonel — eski kayıtlar geçerli
kalır) ve tamamlama kartında ayrı bir kutuda gösterilir.

**Bağlı davranış:** Süre dolarken yazılmış ama kontrol edilmemiş yanıt, adım
kapanmadan kaydedilir — yazılan emek kaybolmasın diye. `accept` varsa otomatik
karar verilir, yoksa doğru/yanlış damgası vurulmadan yalnızca deftere yazılır.


---

## Verildi · Yapay zekâ kullanıcının kendi anahtarıyla çalışır (BYOK)

> **BYOK = "Bring Your Own Key"** — "kendi anahtarını getir". Yapay zekâ
> özelliği uygulamayla gelir ama API anahtarı kullanıcınındır: kota ve fatura
> ona ait, geliştiricinin ayakta tuttuğu bir sunucu yok.

**Karar (2026-09-20):** Yapay zekâ değerlendirmesi, uygulamayı kuran kişinin
**kendi Google Gemini anahtarıyla** çalışır. Anahtar Ayarlar → Yapay Zekâ
Değerlendirmesi ekranından giriliyor, cihazın kasasında saklanıyor ve çağrılar
doğrudan Google'a gidiyor. Sunucu (proxy) yolu kodda duruyor ama artık
varsayılan değil, "Gelişmiş" altında.

**Bu karar 2026-09-08'deki elemeyi geri alıyor.** O gün BYOK "sıradan kullanıcı
konsol ve fatura kartı adımlarından döner" diye elenmişti. İki şey değişti:

1. **Gerekçe büyük ölçüde geçersiz.** Google AI Studio anahtarı bugün kredi
   kartı istemeden, ücretsiz katmanla alınıyor. Adım sayısı üç: sayfayı aç,
   anahtarı kopyala, yapıştır.
2. **Alternatifin bedeli netleşti.** "Aşama 1b" (geliştiricinin sunucusu +
   ortak ücretsiz kota) tek anahtarın kotasını bütün kullanıcılara
   paylaştırıyor, maliyeti ve kötüye kullanım riskini geliştiriciye yüklüyor ve
   sürekli ayakta duran bir sunucu gerektiriyor. Kullanıcı sayısı arttıkça
   önce kota biter, sonra fatura gelir.

**Neden şimdi:** Uygulama bugüne kadar yapay zekâyı yalnızca Ayarlar'da *sunucu
adresi* doluysa açıyordu. Yani değerlendirmeyi görmek için kullanıcının kendi
makinesinde `server/server.ts`'i çalıştırıp telefonu aynı ağa alması
gerekiyordu. Pratikte özellik hiç kimsede açılmıyordu — geliştiricide bile.

**Kasıtlı tasarım:**
- **Anahtar kasada, JSON deposunda değil.** `expo-secure-store` (iOS Keychain /
  Android Keystore), `WHEN_UNLOCKED_THIS_DEVICE_ONLY` ile: cihaz yedeğine
  girmiyor, başka cihaza kopyalanmıyor. `storage.ts` her şeyi düz JSON olarak
  belge klasörüne yazdığı için anahtar oraya konmadı.
- **Anahtar başlıkta gidiyor, sorgu dizesinde değil** (`x-goog-api-key`). URL'ler
  günlüklere ve çökme raporlarına düşebiliyor, başlıklar düşmüyor.
- **Anahtarın tamamı hiçbir ekranda gösterilmiyor** — yalnızca maskeli biçim
  (`AIza…7f3K`).
- **Önce doğrula, sonra kaydet.** Kurulumda anahtar canlı bir çağrıyla
  sınanıyor; geçmezse kaydedilmiyor. Böylece "kaydettim ama çalışmıyor" hâli
  oluşmuyor.
- **Eşzamansızlık.** Kasadan okuma `await` gerektiriyor, oysa `aiAvailable()`
  senkron cevap veriyor. Anahtar açılışta bir kez okunup bellekte tutuluyor;
  ekranlar `useApiKey()` / `useAiAvailable()` ile abone. Senkron `aiAvailable()`
  çağıran ekranlar hook'a çevrildi, yoksa ilk karede "kapalı" deyip öyle
  kalıyorlardı.

**Bağlı kural — yapay zekâ hâlâ şart değil.** Yukarıdaki "uygulamayla gelir ama
şart değildir" kuralı aynen geçerli: anahtar yokken uygulamanın tamamı
çalışıyor, yalnızca değerlendirme katmanı kapalı. Kapalıyken gösterilen metnin
yanında artık kuruluma götüren bir düğme var — eskiden yalnızca "kullanılamıyor"
yazıyordu ve kullanıcı nereden açacağını bulamıyordu.

**Gizlilik:** Anahtar hiçbir sunucuya gönderilmiyor. Değerlendirme istendiğinde
mülakat metni/sesi doğrudan Google'a gidiyor ve kullanım kullanıcının kendi
hesabının kotasından düşüyor. Bu, kurulum ekranında açıkça yazıyor.

**Neden "Google ile devam et" değil:** Google Sign-In kimlik doğrular, Gemini
erişimi vermez. Gemini API anahtar tabanlı; son kullanıcının Google hesabıyla
oturum açıp kendi Gemini kotasını harcaması diye bir yol yok (Vertex AI tarafı
servis hesabı ve GCP projesi istiyor, son kullanıcı OAuth'u değil). Bu yüzden
"giriş yap → yapay zekâ açılsın" akışı kurulamıyor.

**Açık kalan:** Ortak sunucu yolu (Aşama 1b) tamamen kapanmadı; kod duruyor ve
ileride ücretsiz kota/sunucusuz barındırma sınırları ölçülürse ikinci bir
seçenek olarak açılabilir — YAPILACAKLAR Bölüm 00.

---

## Verildi · Üç uygulamaya ayrılma ve kapsam paylaşımı (2026-10-04)

**Karar:** Kod tabanı üç uygulamaya ayrılıyor. Kardeşler Terakki'nin kopyasından
dönüştürülerek üretiliyor; her birinin dönüşüm planı kendi dosyasında.

| Uygulama | Kime | Kapsam |
| --- | --- | --- |
| **Terakki** | Yalnızca sahibine (tek kullanıcı) | **Her şey.** Yedi sütun olduğu gibi kalır, hiçbir modül çıkmaz. Üst küme. |
| **İrtifa** | Genele | **Mülakat ve iş.** Simülasyon, sektör/kurum kataloğu, günlük alan testi, iş hayatı & kariyer yönetimi. |
| **Fesahat** | Genele | **Dil, konuşma, anlayış, kavrayış, iletişim.** |

**Neden üç:** Terakki yedi sütunu tek çatıda topluyor ve sahibine göre kurulu;
genele açılacak bir uygulamada bu genişlik dağınıklık oluyor. İki kardeş birer
odak alıyor, Terakki hepsini kendinde tutmaya devam ediyor.

**Türeyen üç sonuç:**

1. **Bölüm 00 aşama 2 (alanı kataloğa taşı) İrtifa'ya devredildi.** O iş
   "yazılım şirketine hazırlanan biri uygulamayı açtığında kendine uygun hiçbir
   şey bulamaz" diye açılmıştı. Terakki tek kullanıcılı olduğuna göre o kullanıcı
   yok; sektör soyutlaması Terakki'de karşılığı olmayan bir genelleştirme.
   Katalog, genele açılan mülakat uygulamasının işi. Terakki'de kariyer & mülakat
   **kalır**; sahibi başka sektöre de hazırlanırsa `companies.ts` /
   `questions.ts` havuzlarına kayıt eklenir, mimari değişmez.
2. **Kimlik sabitleri Terakki'de değişmez.** `STORE_DIR = 'savunma-store'`,
   `DB_NAME = 'terakki.db'`, `AUDIO_DIR = 'terakki-audio'` ve `terakki.*`
   bildirim ön ekleri olduğu gibi kalıyor: cihazda veri var ve `savunma-store/`
   SQLite göçünün kaynağı, yeniden adlandırmak göç yolunu koparır. Yeniden
   adlandırma yalnızca kardeşlerde yapılır — orada temiz kurulum olduğu için
   bedava, yayından sonra ise veri göçü kodu gerektirir.
3. **İrtifa savunma sanayiine kilitlenmez.** Savunma içeriği (beş kurum, soru
   bankası, haberler) kataloğun **ilk girdisi** olarak kalır; ad, kimlik ve tema
   hiçbir sektöre bağlanmaz. "Taktiksel" tema çerçevesi ve askerî metaforlar
   arayüzden çıkar.

**Fork öncesi tek engel:** cihazda doğrulama turu. Dört native modül
(`expo-sqlite`, `expo-secure-store`, `expo-clipboard`, `expo-system-ui`)
telefonda hiç görülmedi; doğrulanmadan kopyalanırsa bulunan her hata üç kod
tabanında düzeltilir. Doğrulanana kadar Terakki'ye yeni özellik yazılmaması
kararlaştırıldı — yazılan her satır doğrulanmamış yüzeyi büyütüp üç yere gidiyor.

---

## Verildi · Yapay zekâ her üç uygulamada bulunabilir (2026-10-04)

**Karar:** Yapay zekâ katmanı **Terakki, İrtifa ve Fesahat'ın üçünde de**
bulunur. Temel her yerde aynı: **BYOK** — kullanıcı kendi Google Gemini
anahtarını girer, anahtar cihazın kasasında durur, çağrılar doğrudan Google'a
gider (yukarıdaki "Yapay zekâ kullanıcının kendi anahtarıyla çalışır" kararı).

**Bu karar Fesahat'ın "sıfır ağ" tasarımını geri alıyor.**
`YAPILACAKLAR_FESAHAT.md` 2026-09-11'de "mülakat motoru ve yapay zekâ
bağımlılıkları tamamen sökülerek uygulama %100 çevrimdışı kılınacak" diyordu.
Mülakat sökülüyor; **yapay zekâ sökülmüyor.**

**Neden değişti:**

1. **Sökmenin gerekçesi BYOK ile buharlaştı.** "Çevrimdışı olsun" kararı
   yapay zekânın ayakta duran bir sunucu, kota ve fatura getirdiği dönemde
   verilmişti. BYOK'tan sonra geliştiricinin işletme maliyeti **sıfır**:
   sunucu yok, kota kullanıcının. Katmanı tutmanın bedeli kalmadı.
2. **Fesahat'ta yapay zekânın gerçek bir işi var.** Çevrimdışı tasarım,
   *tek doğru cevabı olmayan* alıştırmaları öz-değerlendirmeye ya da çoktan
   seçmeliye mahkûm ediyordu: özetleme, iletişim senaryoları, belagat "üret"
   aşaması. Anahtar varken serbest yazılı cevap değerlendirilebiliyor — bu,
   alıştırmaların tasarımını kısıtlamaktan çıkarıyor.
3. **Altyapı zaten kopyalanıyor.** `aiAvailability`, `aiCredentials`,
   `geminiClient`, `AiSetupScreen`, `AiInsightCard` Terakki'den hazır geliyor
   ve çalışıyor. Sökmek iş, tutmak bedava.

**Değişmeyen kural — çevrimdışı çalışma garanti olarak kalıyor.** "Hiç ağ
çağrısı olmasın" hedefi düştü, yerine **"ağ olmadan da her şey çalışsın"**
geldi. Üç uygulamada da: anahtar yokken uygulamanın hiçbir parçası bozulmaz,
her ekran açılır, her alıştırma yapılır ve **teknik hata mesajı gösterilmez**;
yalnızca değerlendirme/üretim katmanı kapalı kalır. Her çağrı
`aiAvailability` kontrolünden geçer (`CLAUDE.md` kuralı).

**Kasıtlı sınır:** yapay zekâ **değerlendirir ve üretir, kapıda durmaz.** Hiçbir
uygulamada bir içeriğe erişmek, bir alıştırmaya başlamak ya da ilerlemeyi
görmek için anahtar gerekmez. Anahtarsız kullanıcı eksik bir uygulama değil,
değerlendirme katmanı kapalı bir uygulama kullanır.

**Açık kalan:** Fesahat'ta içerik üretimi (okuduğunu anlama soruları, sözel
analoji setleri) yapay zekâya devredilecek mi? İrtifa'nın aynı sorusu
(`YAPILACAKLAR_İRTİFA.md` Bölüm 3 — determinizm, kota, kalite denetimi) önce
ölçülecek; iki uygulama için iki kez çözülmeyecek.


---

# İrtifa kararları

Aşağıdakiler İrtifa'ya özeldir; yukarıdaki Terakki kayıtlarını ilgili yerlerde
geçersiz kılar.

## Verildi · Uygulamanın adı: **İrtifa** (2026-10-04)

**Karar:** Genele açılan mülakat uygulamasının adı **İrtifa**.

**Neden:** "İrtifa" yükseklik demek; kariyerde yükselmeyi doğrudan anlatıyor,
kısa ve Türkçe. Hiçbir sektöre bağlı değil — savunma sanayii kataloğun ilk
girdisi olsa da ad, tema ve kimlik sektörsüz kalmalı (fork kararı, madde 3).

### Yeni kimlikler

| Yer | Değer |
| --- | --- |
| Uygulama adı (`app.json` → `name`) | `İrtifa` |
| Expo slug | `irtifa` |
| Android paketi / iOS bundle id | `com.irtifa.app` |
| npm paket adı | `irtifa` |
| Sunucu paketi | `irtifa-backend` |
| Depo klasörü | `irtifa-store` |
| Veritabanı | `irtifa.db` |
| Ses klasörü | `irtifa-audio` |
| Bildirim ön eki | `irtifa.*` |

⚠️ Paket kimliği Terakki'den **farklı** olmak zorunda: aynı telefonda üç kardeş
uygulamanın yan yana durabilmesi için üçünün de ayrı kimliği olmalı. Kimlik
sabitleri yayından **önce** değiştirildi; sonrasında veri göçü kodu gerekirdi.

## Verildi · Marka: yükselen İ, lacivert + zümrüt (2026-10-05)

**Karar:** İşaret, noktası yukarı bakan bir ok ucuna dönüşmüş "İ" harfi. Palet
lacivert zemin (`#0F172A`) + zümrüt vurgu (`#10B981`).

**Neden:** Harf adı doğrudan okutuyor, ok yükselişi anlatıyor. Palet kurumsal ve
ciddi ama **sektörsüz**: "taktiksel tema" fikri savunma/havacılık çağrışımıyla
seçilmişti, kapsam "mülakat ve iş"e genişleyince askerî çerçeve ve metaforlar
(telemetri dili, hedef/kilitlenme) arayüzden çıkarıldı. Yazılım sektörüne
hazırlanan kullanıcı da aynı ekranı kendine ait görmeli.

**Terakki'nin Kademe işareti devralınmadı:** o işaret "yedi sütunlu gelişim"
anlatısına aitti ve adın baş harfini taşımıyordu. Arşiv: `assets/brand/arsiv/terakki/`.

**Renklerin tek kaynağı** `src/components/themeTokens.ts` → `BRAND`; ikon SVG'si,
`app.json` ve `SplashOverlay` aynı değerleri taşır.

**Splash yazısı canlı metne döndü.** Terakki, Italianno fontunda 'i' noktasının
kırpılması yüzünden yazıyı görsel olarak üretiyordu; sistem fontunda bu sorun
yok ve splash font yüklenmesini beklemiyor.

## Verildi · Sektör katalogdan gelir, kullanıcı seçer (2026-10-05)

**Karar:** Sektör, kurum ve departman koda gömülmez; `src/data/sectors.ts`
kataloğundan gelir. Kullanıcı yazmaz, **seçer** (oryantasyonda bir adım,
sonra Profil'den).

**Uygulanışı:**

- `CompanyId` birleşim tipinden **serbest kimliğe** döndü. Gerekçe: katalog
  büyüdükçe tip tanımı değişmesin ve diskteki eski kayıt derlemeyi bozmasın.
  Diskten gelen kimlik her zaman `findCompany` / `findDepartment` ile gevşek
  aranır; bulunamazsa "seçilmedi"ye düşer.
- Departman **sektörün altında** anlam kazanır; `Profile.sectorId` ve
  `targetDepartment` birlikte doğrulanır (`hydrateCatalog`).
- Yapay zekâ istemindeki mülakatçı rolü sektör kaydından üretilir
  (`interviewerRole`); sektör yoksa nötr rol kullanılır.
- Sektör seçilmemişse uygulama **bütün** kurumlarla çalışır — boş ekran yerine
  tam katalog.

**İlk katalog:** savunma sanayii (5 kurum, 10 alan) + yazılım & teknoloji
(6 kurum, 9 alan). Hiçbiri ayrıcalıklı değil.

## Verildi · Günün alan testi yalnızca yazılı, 1 ağır + 2 kısa (2026-10-05)

**Karar:** Hedef alana göre günlük set üç sorudan oluşur: biri ağır (açık uçlu,
muhakeme isteyen), ikisi kısa (terim, hızlı hesap, küçük senaryo). Format
yalnızca yazılı; kamera ve mikrofon yok.

**Neden:** Tek soru günü temsil etmiyor, beş soru günlük alışkanlığı yük hâline
getiriyor. Ağır soru derinliği, kısa sorular kapsamı veriyor. Yazılı akış kısa,
her gün tekrar edilebilir ve izin istemiyor; sunum tarafını zaten günün mülakatı
karşılıyor.

**Türeyen sonuçlar:**

- `audioStore` / `captureBuffer` yolu bu akışta hiç kullanılmaz.
- Akıcılık, konuşma temposu ve dolgu kelime metrikleri alan testine
  **uygulanmaz**; karnede ayrı ölçülür (doğruluk).
- Ağır soru sette **her zaman bir tane**; ikiye çıkarsa günlük iş bırakılır.

**Değerlendirme iki katmanlı:** anahtar varken yapay zekâ üç cevabı birlikte
puanlar; yokken sorunun `keyPoints` alanı açılır ve kullanıcı kendisi işaretler.
Serbest metne otomatik doğru/yanlış damgası vurulmaz (yukarıdaki "otomatik
kontrol ile öz-değerlendirmenin ayrımı" kararı).

**Havuz tek.** Mülakat simülasyonu, alan testi ve teknik soru bankası **aynı**
havuzu kullanır; ikinci bir soru deposu kurulmaz.

## Verildi · Alan testi mülakatla aynı depoda, `kind` ile ayrışır (2026-10-05)

**Karar:** Alan testi oturumları ayrı bir depoya değil, `interviewHistory`
içine yazılır; tür `kind: 'interview' | 'fieldTest'` alanıyla ayrılır.

**Neden:** İkisi de "bugün ne yaptım"ın parçası ve karne ikisini birlikte
okuyor; iki ayrı depo iki ayrı geçmiş ekranı ve iki ayrı trend demekti. Ayrım
**moddan** yapılamıyor: alan testi her zaman `mode: 'typing'`.

**Sonuçlar:** alanı olmayan eski kayıtlar mülakat sayılır (`sessionKind`); alan
testinde `companyId` boş kalır (set kurumdan bağımsız) ve görünen ad alanın
adıdır; setin puanı değerlendirilmiş soruların ortalamasıdır, hiçbiri
değerlendirilmemişse puansız kalır (0 puan gibi görünmesin).

## Verildi · Beş sekme; Profil sekme değil (2026-10-05)

**Karar:** Mülakat · Kriz · Atölye · Kariyer · Karne. Profil ve Ayarlar, Karne
başlığındaki düğmeden açılır.

**Neden:** Kapsam "mülakat **ve iş**" olduğu için kariyer yönetimi kendi
sekmesini hak ediyor — mülakat tek seferlik bir olay, iş arama süreci haftalar
sürüyor. Profil günlük bir iş değil; sekme çubuğunda yer kaplamak yerine
ölçümlerin yanında duruyor.

**Kriz ve maaş aynı sekmede** ama ayrı bloklarda: ikisi de "hazırlıksız
yakalanılan an", ama kriz **baskı**, maaş **pazarlık** — biri hasarı durdurmayı,
öteki konuşmayı sürdürmeyi ister. Süreler de farklı (10/90 sn ve 20/120 sn).

## Verildi · Başvuru takibi kanban değil, aşamaya göre liste (2026-10-05)

**Karar:** Başvurular yatay kanban yerine aşamaya göre gruplanmış dikey liste
olarak gösterilir.

**Neden:** Telefonda yatay kaydırmalı kanban okunmuyor; aynı bilgiyi dikey
gruplar da veriyor. Aşama değişiklikleri kaydın `history` dizisine yazılıyor,
böylece "ne zaman ne oldu" kayboluyor değil.

**Şirket adı serbest metin:** katalog mülakat simülasyonu için; başvuru takibi
katalogda olmayan şirketleri de tutabilmeli. Katalogdaki bir kurum seçilirse
şirket notu ve simülasyon o kayda bağlanır.

**Takip ayrı depo değil:** teşekkür mesajı ve öz-değerlendirme başvurunun
alanları (`followUpSent`, `selfReview`) — kendi başına bir kayıt değil.

**Uygulama e-posta göndermez.** Şablon panoya kopyalanır, gönderme kullanıcının
kendi posta uygulamasında kalır: adres, imza ve gönderim izni bizim tarafımızda
tutulacak şeyler değil.

## Verildi · Egzersizler mülakat çerçevesine alındı (2026-10-05)

**Karar:** Egzersizler kalır ama genel yaşam rutini olarak değil, **mülakat
anına** hizmet eden pratikler olarak: mülakat nefesi (heyecan, ses titremesi),
mülakat diksiyonu (dolgu kelime, tempo), mülakat zekâsı (kriz sorusu, STAR),
kamera önü duruş.

**Çıkarılanlar:** göz sağlığı egzersizleri ve genel yaşam hatırlatıcıları (su
içme, ayağa kalk, göz molası, şükür notu) — mülakat başarısıyla bağı yok.
Kategori adlarındaki beyin lobu anlatısı ("Ön Lob (Frontal)") da kalktı; yerine
ne işe yaradığını söyleyen adlar geldi ("Karar & Kriz Çözümü").

**Dinî içerik ve dil & ifade modülleri alınmadı** (fork kararı): Risale
vecizeleri ve günün duası Terakki sahibine özel; lugat ve belagat kardeş
uygulama Fesahat'ın kapsamı.
