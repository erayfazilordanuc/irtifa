# İkon tasarım promptu

Logoyu dışarıda tasarlatmak için hazırlanmış brief. Aşağıdaki İngilizce metni
olduğu gibi kopyalayıp araca yapıştır — modeller İngilizce promptlara belirgin
biçimde daha iyi cevap veriyor.

---

## Prompt (kopyala)

```
A minimalist flat vector logo mark for "Terakki", a personal-development app.

CONCEPT — ascent through order. The mark must carry four ideas at once:
rising, growth, order, system. Think modular geometry: identical units
arranged by a strict rule, progressing upward. Structure, not decoration.
The composition should imply continuation — it must not feel finished or closed.

STYLE — flat vector. Geometric. One solid color, no gradient inside the mark.
No shadows, no 3D, no perspective, no texture, no bevel, no glow.
No text, no letters, no numbers. No human figures. No literal objects:
no books, no lamps, no flames, no arrows, no light bulbs, no bar charts,
no mountains, no trees.

COMPOSITION — a single centered mark on a fully transparent background.
Square canvas. Generous, even margin: the mark occupies the central 70–75%.
Balanced optical weight; nothing crowding an edge or a corner.

COLOR — solid emerald green, exactly #059669.

LEGIBILITY CONSTRAINTS — the mark must survive as a solid one-color silhouette
at 48×48 pixels. No stroke or element thinner than 1/12 of the canvas width.
No fine detail. No enclosed negative space smaller than 1/20 of the canvas.

OUTPUT — SVG. If SVG is not available, a 1024×1024 PNG with a transparent
background.
```

---

## Hangi araç

| Araç | Neden | Not |
| --- | --- | --- |
| **Recraft** (recraft.ai) | **Birinci tercih.** Gerçek vektör/SVG üretiyor, "Icon" ve "Logo" stilleri var, marka rengini sabitleyip SVG dışa aktarabiliyorsun. | Geometrik düz marka için doğru araç |
| Bir dil modeline SVG yazdırmak | Katı geometrik markalarda difüzyon modellerini genelde geçiyor: kesin koordinat, kesin hex, gerçek vektör, hassas yineleme | `assets/brand/` altındaki adaylar bu yolla üretildi |
| Figma | Çizebilen biri için bu marka 10 dakikalık iş, kontrol tamamen sende | Model kullanmadan |
| Midjourney / Imagen / DALL·E | **Yalnızca yön aramak için.** | Aşağıya bak |

⚠️ **Difüzyon modelleri (Midjourney vb.) bu iş için yanlış araç.** Raster
üretiyorlar, kesin hex'e uymuyorlar, istemsizce gölge/degrade/3B ekliyorlar ve
küçük boyutta okunurluğu gözetmiyorlar. Yön bulmak için kullan, çıkanı vektör
olarak yeniden çizdir.

---

## Bana ne göndermelisin

**Markanın kendisi, şeffaf zeminde, tercihen SVG.**

Yuvarlak köşeli, zemini gömülü bitmiş bir uygulama ikonu **gönderme**. Ondan
şeffaf zeminli splash ikonunu ve tek renk siluet olan monochrome ikonunu
türetemem — zemini geri sökmek gerekir ve sonuç bozulur.

Elimde şeffaf marka olursa altı hedefin hepsini kurallarına uygun üretirim:

| Dosya | Kural |
| --- | --- |
| `icon.png` | 1024×1024, kenarlara kadar dolu, şeffaflık yok |
| `splash-icon.png` | Şeffaf zemin, zemin `backgroundColor`'dan gelir |
| `favicon.png` | 48×48 |
| `android-icon-foreground.png` | Şeffaf, kenarlardan ~%25 güvenli boşluk |
| `android-icon-monochrome.png` | Tek renk düz siluet, şeffaf zemin |
| `notification-icon.png` | Beyaz siluet, şeffaf zemin |

Renkler bu klasördeki `README.md`'de; degrade zemini ben uygularım.
