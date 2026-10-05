// Yüzen alt sekme çubuğunun ölçüleri — TEK KAYNAK.
//
// Hem çubuğun kendisi (App.tsx → `tabBarStyle`) hem de sekme ekranlarının
// kaydırma alanına bıraktığı alt boşluk (`AppScreen`) buradan besleniyor.
// Eskiden boşluk elle yazılmış sabit bir sayıydı (124); çubuğun yüksekliği ya
// da alttaki boşluğu değişince içerik çubuğun altına giriyordu.

/** Çubuğun yüksekliği. */
export const TAB_BAR_HEIGHT = 68;

/** Çubuğun yanlardan ve alttan bıraktığı eşit boşluk. */
export const TAB_BAR_MARGIN = 20;

/** Çubuk ile içeriğin son öğesi arasındaki nefes payı. */
export const TAB_BAR_CONTENT_GAP = 16;

/**
 * Sekme çubuğu olan ekranlarda kaydırma içeriğinin alt boşluğu.
 *
 * Güvenli alan da ekleniyor: çubuk ekranın alt kenarına göre konumlandığı için
 * jest çubuğu / ev düğmesi alanı olan cihazlarda görsel olarak yukarı kayıyor.
 * Fazladan birkaç piksel boşluk kalması, içeriğin çubuğun altında kalmasından
 * her zaman iyidir.
 */
export function tabBarContentPadding(bottomInset: number): number {
  return bottomInset + TAB_BAR_MARGIN + TAB_BAR_HEIGHT + TAB_BAR_CONTENT_GAP;
}
