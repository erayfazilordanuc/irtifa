# <PROJE ADI> — Claude çalışma kılavuzu

> **Bu bir şablondur.** Yeni bir projede `CLAUDE.md` olarak kopyala, `<...>`
> yerlerini doldur, projeye uymayan satırları **sil**. Boş bırakılmış madde,
> yanlış doldurulmuş maddeden iyidir: Claude burada yazanı kural sayar.

<Tek paragraf: proje ne, hangi dil/çatı, hangi sürümler, kim için.>
<Varsa kritik ilke: "X olmadan da %100 çalışmalı", "offline-first", "arayüz dili Türkçe" gibi.>

## Önce oku

<Projede durum/karar taşıyan belgeler. Yoksa bu tabloyu sil.>

| Belge | Ne zaman |
| --- | --- |
| `<YOL_HARITASI.md>` | Her iş öncesi — sıradaki iş nerede yazıyor |
| `<KARARLAR.md>` | Verilmiş kararlar ve gerekçeleri; buradaki kararı yeniden tartışma |
| `<KURULUM/TUZAKLAR.md>` | Derleme / kurulum öncesi **zorunlu** |

## Triyaj — pahalı modeli boşuna harcama

Her **yeni istekte** önce zorluğu ölç, sonra kimin yapacağına karar ver. Ana
oturum kolay işi kendisi yapmaz.

| | Kim yapar | Örnek |
| --- | --- | --- |
| **Kolay** | `triyaj` (ucuz model) yapar, ana oturum diff'i ve doğrulamayı kontrol eder | Yazım/etiket düzeltmesi, sabit değer değişimi, belge güncellemesi, kullanılmayan import temizliği |
| **Soru** | `kasif` (ucuz model) | "X nerede tanımlı", "Y akışı nasıl işliyor" |
| **Zor** | Ana oturum planlar; gerekirse uygulayıcı/denetçi dağıtır | Çok dosyalı değişiklik, yeni modül/veri modeli, sebebi bilinmeyen hata, tasarım/ürün kararı |

Özet ölçüt: **tek dosya + ~20 satır altı + istekten birebir anlaşılıyor +
mevcut bir deseni tekrarlıyor** → kolay. Hepsi birden doğru değilse zor.

> **Şüphedeysen zor say.** Yanlış "kolay" kararı kullanıcıya bozuk iş döndürür;
> yanlış "zor" kararı yalnızca biraz token harcar.

> ⚠️ Sınır: Bu dosya oturumun **hangi modelle açıldığını** değiştiremez, onu
> `/model` belirler. Triyaj *işi* ucuz modele kaydırır; mesajı yine ana oturum
> okur.

## Çalışma sırası

- Kullanıcı yeni bir iş belirtmezse `<YOL_HARITASI.md>` → "<Sıra>" listesindeki **ilk tamamlanmamış** işe geçilir.
- Kullanıcının bir mesajındaki **her madde** ele alınır. Bu turda yapılamayan madde sessizce atlanmaz; nedeniyle birlikte yol haritasına yazılır.
- Yapılan ama **gerçek ortamda görülmemiş** iş ✅ değil ⏳ işaretlenir ve "<doğrulanacaklar>" listesine eklenir.

## Kurallar

<Buraya projenin kendi kuralları. Aşağıdakiler yaygın olanlar — uymayanları sil.>

- Doğrulama: `<npm test / npx tsc --noEmit / cargo check>` — şu an **<0 hata>**, öyle kalmalı.
- <Stil/tema: renkler nereden gelir, sabit değer gömülür mü.>
- <Erişilebilirlik: yeni etkileşimli öğelere ne eklenir.>
- <Üretilen dosyalar elle düzenlenmez: `<üretici komut>` ile yeniden üretilir.>
- <Kurulum tuzağı: ör. `npm install` sonrası elle çalıştırılacak komut.>
- Commit yalnızca kullanıcı isteyince. Biçim: `feat: …`, `fix: …`, `chore: …`.
- Kalıcı bilgi: karar → `<KARARLAR.md>`, plan/durum → `<YOL_HARITASI.md>`.
- <Gizli bilgi / anahtar nereye yazılmaz.>

## Orkestrasyon

<Alt ajan kullanmıyorsan bu bölümü tamamen sil.>

Ana oturum **planlar, böler, dağıtır, doğrular**. Uygulamayı alt ajanlar yapar.
Ajan tanımları `.claude/agents/` altında.

| Ajan | Model | İş | Yazar mı |
| --- | --- | --- | --- |
| `triyaj` | ucuz | İsteği kolay/zor ayırır; kolaysa kendisi yapar | Evet (dar kapsam) |
| `kasif` | ucuz | Kod tabanında keşif, salt okuma | Hayır |
| `uygulayici` | orta | Net tanımlı tek bir iş paketini uygular | Evet |
| `denetci` | orta | Değişikliği plana ve kurallara göre inceler | Hayır |
| `belgeci` | ucuz | Durum/karar belgelerini günceller | Yalnız `.md` |

### Akış

1. **Anla** — Bilinmeyen alanlar için `kasif`'e dar sorular sor; bağımsızsa paralel.
2. **Planla** — İşi bağımsız paketlere böl. Çok dosyalı ya da kullanıcı kararı gerektiren işlerde planı önce kullanıcıya göster.
3. **Dağıt** — Her paket bir `uygulayici`. Aynı dosyalara dokunmayanlar paralel; aynı dosyaya dokunanlar sıralı.
4. **Doğrula** — `denetci` diff'i inceler. Ana oturum bulguları ve doğrulama komutunun sonucunu **kendisi** kontrol eder.
5. **Kaydet** — `belgeci` durum belgelerini günceller. Kullanıcıya kısa rapor: ne yapıldı, ne doğrulandı, ne açık kaldı.

### Ne zaman devredilmez

- Birkaç satırlık tek dosya değişikliği ya da tek aramayla bulunacak şey → ana oturum kendisi yapar. Ajan her seferinde bağlamı sıfırdan kurar; küçük işte pahalıdır.
- Tasarım / ürün kararı gerektiren sorular → ajana değil **kullanıcıya**.

### İş paketi şablonu

Alt ajan bu konuşmayı görmez; brif tek başına yetmeli.

```
Amaç: <tek cümle — ne ve neden>
Bağlam: <ilgili karar/plan bölümü, bilinen tuzaklar>
Dosyalar: <dokunulacaklar; açıkça dokunulmayacaklar>
Yapılacak: <adımlar>
Kabul kriterleri: <gözlenebilir koşullar>
Doğrulama: <komut>
Rapor: değişen dosyalar, yapılmayanlar, şüpheli noktalar
```

---

## Bu şablonu nasıl özelleştiririm

1. Dosyayı proje köküne `CLAUDE.md` olarak kopyala.
2. `<...>` yerlerini doldur; **kullanmadığın bölümü sil** (yarım kalmış bölüm kafa karıştırır).
3. "Kurallar" kısmını gerçekten uyguladığın kurallarla sınırla. Uyulmayan kural, tüm dosyanın güvenilirliğini düşürür.
4. Orkestrasyon kullanacaksan `.claude/agents/` altına ajan tanımlarını ekle;
   tablodaki adlarla dosya adları birebir aynı olmalı.
5. Proje büyüdükçe güncelle: burada yazan bir kural artık geçerli değilse **sil**.
