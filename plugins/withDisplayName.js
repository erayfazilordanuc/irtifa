const { withStringsXml, AndroidConfig } = require('@expo/config-plugins');

/**
 * Android'de görünen uygulama adını Türkçe yazımıyla ayarlar.
 *
 * NEDEN GEREKLİ: `app.json` → `expo.name` hem cihazda görünen adı hem de
 * **native proje adlarını** belirliyor. Ad ASCII dışı bir harfle başlayınca
 * (İrtifa'daki "İ") Expo'nun prebuild'i Android paket adını yanlış türetiyor:
 * dosyalar `com/irtifa/app/` altına yazılıyor ama Kotlin dosyalarının paket
 * satırı `com.irtifa` oluyor. Sonuç, derlemede:
 *
 *     MainApplication.kt: Unresolved reference 'BuildConfig'
 *
 * Bu yüzden `expo.name` ASCII tutuluyor ("Irtifa") ve görünen ad buradan
 * (Android) ve `ios.infoPlist.CFBundleDisplayName` (iOS) üzerinden
 * yazılıyor. İkisi birlikte değişmeli.
 */
const DISPLAY_NAME = 'İrtifa';

module.exports = function withDisplayName(config) {
  return withStringsXml(config, (cfg) => {
    cfg.modResults = AndroidConfig.Strings.setStringItem(
      [{ _: DISPLAY_NAME, $: { name: 'app_name', translatable: 'false' } }],
      cfg.modResults,
    );
    return cfg;
  });
};
