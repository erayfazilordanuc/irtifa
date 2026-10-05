// Türkçeye duyarlı metin yardımcıları.

/**
 * Türkçe büyük harfe çevirir.
 *
 * NEDEN GEREKLİ: JavaScript'in `toUpperCase()`'i (ve CSS'in `text-transform`'u)
 * yerelden bağımsız çalışır; 'i' harfini 'I' yapar. Türkçede 'i'nin büyüğü
 * **İ**, 'ı'nın büyüğü **I**'dır. Bu yüzden "Dil & İfade" başlığı ekranda
 * "DIL & İFADE" diye çıkıyordu.
 *
 * Bu iki harf önce elle eşlenir, sonra geri kalanı normal şekilde büyütülür.
 *
 * ⚠️ Sabit başlıklarda bu yardımcıya gerek yok: metni kaynakta doğrudan büyük
 * harfle yazmak yeterli (`uppercase` sınıfı zaten büyük harfe dokunmaz).
 * Burası yalnızca metin çalışma anında belirlendiğinde kullanılır.
 */
export function trUpper(text: string): string {
  return text.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

/**
 * Türkçe küçük harfe çevirir — 'I' → 'ı', 'İ' → 'i'.
 * `trUpper` ile aynı gerekçe.
 */
export function trLower(text: string): string {
  return text.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
}

/**
 * Cevap karşılaştırması için metni sadeleştirir: Türkçeye duyarlı küçük harfe
 * çevirir, noktalama/ayraçları (`·`, `.`, `,`, `;`, `-`, `—`, `→`, parantez,
 * `°`, `%` vb.) boşluğa çevirir, ardışık boşlukları tekilleştirir.
 *
 * NEDEN GEREKLİ: egzersiz motorundaki `accept` listeleri yalnızca cevabın
 * çekirdeğini tutuyor (ör. "42"); kullanıcının "42." ya da "42 " gibi
 * varyasyonları da bu sadeleştirmeden sonra eşleşsin diye.
 */
export function normalizeAnswer(text: string): string {
  return trLower(text)
    .replace(/[^a-z0-9çğıöşü]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Metni sayıya çevirir — binlik ayracı `.` (ve boşluk), ondalık ayracı `,`.
 * Sayı gibi görünmeyen girdilerde `null` döner.
 */
function parseNumber(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed.length === 0 || !/^-?[0-9][0-9.,\s]*$/.test(trimmed)) return null;
  const cleaned = trimmed.replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
  if (!/^-?[0-9]+(\.[0-9]+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isNaN(value) ? null : value;
}

/**
 * Türkçe harfleri ASCII karşılığına indirger: ı→i, ş→s, ç→c, ğ→g, ö→o, ü→u.
 *
 * NEDEN GEREKLİ: egzersiz cevabını yazan kullanıcı Türkçe klavye kullanmıyor
 * ya da acele ediyor olabilir; "bati" yazana "batı" beklediğimiz için yanlış
 * damgası vurmak haksız. Karşılaştırma bu indirgeme YAPILDIKTAN SONRA da bir
 * kez denenir, indirgeme tek başına kullanılmaz.
 */
function foldTurkish(text: string): string {
  return text
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u');
}

/**
 * Girdi, kabul listesindeki cevaplardan biriyle eşleşiyor mu? Normalize
 * edilmiş TAM eşitlik arar — `includes` KULLANMAZ: aksi hâlde "13" girdisi
 * "113" kabul cevabını yanlışlıkla doğrulardı.
 *
 * Üç deneme sırayla: (1) normalize edilmiş tam eşitlik, (2) Türkçe harfler
 * ASCII'ye indirgenmiş eşitlik ("suzgec" ↔ "süzgeç"), (3) sayısal eşitlik
 * ("1.200" ↔ "1200"). Hiçbiri kelime sırasını ya da eksik kelimeyi hoş
 * görmez; yalnızca yazım varyasyonlarını karşılar.
 */
export function answersMatch(input: string, accepted: string[]): boolean {
  const normalizedInput = normalizeAnswer(input);
  if (normalizedInput.length === 0) return false;
  const foldedInput = foldTurkish(normalizedInput);
  const numericInput = parseNumber(input);
  return accepted.some((candidate) => {
    const normalizedCandidate = normalizeAnswer(candidate);
    if (normalizedInput === normalizedCandidate) return true;
    if (foldedInput === foldTurkish(normalizedCandidate)) return true;
    const numericCandidate = parseNumber(candidate);
    return numericInput !== null && numericCandidate !== null && numericInput === numericCandidate;
  });
}
