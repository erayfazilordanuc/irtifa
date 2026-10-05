import type { CompanyId } from './companies';
import { findSector, SECTORS, type SectorId } from './sectors';

// Sektörel Gelişmeler ekranının iki kaynağı var:
//  1. "Güncel (Canlı)" — RSS akışı, ağdan çekilir; kaynaklar sektör kataloğundan
//     gelir (`sectors.ts` → `news.feeds`), koda gömülü değil.
//  2. Yıl sekmeleri — aşağıdaki elle derlenmiş tarihçe (çevrimdışı da çalışır).
//
// ⚠️ Arşiv bugün yalnızca savunma sanayii girdileri içeriyor (kataloğun ilk
// girdisi). Her kayıt `sectorId` taşıyor; başka sektör eklenince aynı listeye
// kendi girdileriyle katılır, ekran sektöre göre süzer.

/** Seçili sektörün canlı akış kaynakları; sektör seçilmemişse hepsi. */
export function feedsForSector(sectorId: SectorId | ''): string[] {
  const sector = findSector(sectorId);
  return sector ? sector.news.feeds : SECTORS.flatMap((s) => s.news.feeds);
}

export type ArchivePeriod = '2026' | '2025' | '2024' | 'gecmis';

export const ARCHIVE_PERIODS: { id: ArchivePeriod; label: string }[] = [
  { id: '2026', label: '2026' },
  { id: '2025', label: '2025' },
  { id: '2024', label: '2024' },
  { id: 'gecmis', label: 'Geçmiş (Arşiv)' },
];

export type ArchiveEntry = {
  id: string;
  sectorId: SectorId;
  companyId: CompanyId | null;
  title: string;
  summary: string;
  /** Kartın sağ üstünde görünen etiket. */
  dateLabel: string;
  period: ArchivePeriod;
  /** Sektörün yönünü değiştiren gelişmeler işaretlenir. */
  isMilestone: boolean;
  /** "ARAŞTIR" bağlantısı için arama terimi. */
  searchTerm: string;
};

export const ARCHIVE_ENTRIES: ArchiveEntry[] = [
  // ——— 2026 (planlanan / süregelen) ———
  {
    id: 'a-2026-kaan',
    sectorId: 'savunma',
    companyId: 'tusas',
    title: 'KAAN İlk Blok Teslimatları Planlanıyor',
    summary:
      'Milli Muharip Uçak KAAN projesinde seri üretime giden yolda Blok 10 uçağının montajının tamamlanması ve ilk askeri filolara teslimat için son hazırlıkların yapılması bekleniyor.',
    dateLabel: '2026 SÜRECİ',
    period: '2026',
    isMilestone: true,
    searchTerm: 'KAAN Blok 10 teslimat',
  },
  {
    id: 'a-2026-celik-kubbe',
    sectorId: 'savunma',
    companyId: 'aselsan',
    title: 'Çelik Kubbe Katmanlarının Envantere Girişi',
    summary:
      'Alçak, orta ve yüksek irtifa katmanlarını tek komuta kontrol altında birleştiren Çelik Kubbe mimarisinde yeni sistemlerin envantere girmesi ve katmanlar arası entegrasyon testleri sürüyor.',
    dateLabel: '2026 SÜRECİ',
    period: '2026',
    isMilestone: true,
    searchTerm: 'Çelik Kubbe hava savunma katmanlı',
  },
  {
    id: 'a-2026-kizilelma',
    sectorId: 'savunma',
    companyId: 'baykar',
    title: 'KIZILELMA Seri Üretim Hazırlıkları',
    summary:
      'İnsansız savaş uçağı Bayraktar KIZILELMA için hava-hava angajman testlerinin genişletilmesi ve seri üretim hattının devreye alınması gündemde.',
    dateLabel: '2026 SÜRECİ',
    period: '2026',
    isMilestone: false,
    searchTerm: 'Bayraktar KIZILELMA seri üretim',
  },
  {
    id: 'a-2026-tayfun',
    sectorId: 'savunma',
    companyId: 'roketsan',
    title: 'Uzun Menzilli Vuruş Kabiliyetinde Derinleşme',
    summary:
      'TAYFUN ailesinin menzil ve hassasiyet çalışmaları ile hipersonik teknolojilere yönelik test programlarının sürdürülmesi bekleniyor.',
    dateLabel: '2026 SÜRECİ',
    period: '2026',
    isMilestone: false,
    searchTerm: 'Roketsan Tayfun hipersonik',
  },

  // ——— 2025 ———
  {
    id: 'a-2025-kaan-endonezya',
    sectorId: 'savunma',
    companyId: 'tusas',
    title: 'KAAN İçin Endonezya İhracat Anlaşması',
    summary:
      'Endonezya ile imzalanan anlaşma kapsamında KAAN muharip uçağının ihracatı gündeme geldi; bu, milli muharip uçağın ilk yurt dışı müşterisi anlamına geliyor.',
    dateLabel: '2025',
    period: '2025',
    isMilestone: true,
    searchTerm: 'KAAN Endonezya anlaşma',
  },
  {
    id: 'a-2025-eurofighter',
    sectorId: 'savunma',
    companyId: null,
    title: 'Eurofighter Typhoon Tedarik Süreci',
    summary:
      'Türk Hava Kuvvetleri envanterinin güçlendirilmesi amacıyla Eurofighter Typhoon tedariğine yönelik anlaşma süreci ilerledi; teslimat takvimi ve ortak üretim başlıkları öne çıktı.',
    dateLabel: '2025',
    period: '2025',
    isMilestone: true,
    searchTerm: 'Türkiye Eurofighter Typhoon anlaşma',
  },
  {
    id: 'a-2025-hurjet',
    sectorId: 'savunma',
    companyId: 'tusas',
    title: 'HÜRJET İçin İhracat Sözleşmesi',
    summary:
      'Jet eğitim uçağı ve hafif taarruz platformu HÜRJET, yurt dışı müşteriye satışa yönelik sözleşmeyle ihracat listesine girdi.',
    dateLabel: '2025',
    period: '2025',
    isMilestone: false,
    searchTerm: 'HÜRJET ihracat sözleşme',
  },
  {
    id: 'a-2025-siper',
    sectorId: 'savunma',
    companyId: 'aselsan',
    title: 'SİPER Blok Geliştirmeleri ve Teslimatlar',
    summary:
      'Yüksek irtifa hava savunma sistemi SİPER için menzil ve angajman kabiliyetlerini artıran blok çalışmaları sürdürüldü, teslimatlar genişledi.',
    dateLabel: '2025',
    period: '2025',
    isMilestone: false,
    searchTerm: 'ASELSAN SİPER hava savunma',
  },

  // ——— 2024 ———
  {
    id: 'a-2024-kaan-ucus',
    sectorId: 'savunma',
    companyId: 'tusas',
    title: 'KAAN İlk Uçuşunu Gerçekleştirdi',
    summary:
      'Milli Muharip Uçak KAAN, 21 Şubat 2024 tarihinde ilk uçuşunu tamamlayarak Türkiye’yi kendi beşinci nesil savaş uçağını uçuran ülkeler arasına soktu.',
    dateLabel: '2024',
    period: '2024',
    isMilestone: true,
    searchTerm: 'KAAN ilk uçuş 2024',
  },
  {
    id: 'a-2024-tb3',
    sectorId: 'savunma',
    companyId: 'baykar',
    title: 'Bayraktar TB3 Gemiden İniş-Kalkış Yaptı',
    summary:
      'Katlanabilir kanatlı Bayraktar TB3, TCG Anadolu’dan kısa pistte iniş ve kalkış gerçekleştirerek kızaksız gemilerden görev yapabilen ilk İHA oldu.',
    dateLabel: '2024',
    period: '2024',
    isMilestone: true,
    searchTerm: 'Bayraktar TB3 TCG Anadolu iniş',
  },
  {
    id: 'a-2024-celik-kubbe',
    sectorId: 'savunma',
    companyId: 'aselsan',
    title: 'Çelik Kubbe Programı Duyuruldu',
    summary:
      'Farklı irtifa ve menzillerdeki hava savunma sistemlerini yapay zeka destekli tek bir komuta kontrol katmanında toplayan Çelik Kubbe konsepti kamuoyuna tanıtıldı.',
    dateLabel: '2024',
    period: '2024',
    isMilestone: true,
    searchTerm: 'Çelik Kubbe programı',
  },
  {
    id: 'a-2024-ihracat',
    sectorId: 'savunma',
    companyId: null,
    title: 'Savunma İhracatında Rekor Seviye',
    summary:
      'Savunma ve havacılık sektörü yıllık ihracatta tarihi rekor kırarak yerli sanayinin küresel tedarik zincirindeki ağırlığını artırdı.',
    dateLabel: '2024',
    period: '2024',
    isMilestone: false,
    searchTerm: 'savunma sanayi ihracat rekor 2024',
  },
  {
    id: 'a-2024-anka3',
    sectorId: 'savunma',
    companyId: 'tusas',
    title: 'ANKA-3 Test Uçuşlarında İlerleme',
    summary:
      'Kuyruksuz (flying wing) mimariye sahip insansız savaş uçağı ANKA-3, uçuş test programında yeni aşamalara geçti.',
    dateLabel: '2024',
    period: '2024',
    isMilestone: false,
    searchTerm: 'ANKA-3 test uçuşu',
  },

  // ——— Geçmiş (2023 ve öncesi) ———
  {
    id: 'a-arsiv-advent',
    sectorId: 'savunma',
    companyId: 'havelsan',
    title: 'ADVENT Savaş Yönetim Sistemi İhracatı',
    summary:
      'Ağ Destekli Veri Entegre Savaş Yönetim Sistemi ADVENT, dost ve müttefik ülkelerin savaş gemilerinde de kullanılmaya başlandı ve ihracat başarıları elde etti.',
    dateLabel: '2023',
    period: 'gecmis',
    isMilestone: true,
    searchTerm: 'HAVELSAN ADVENT savaş yönetim sistemi',
  },
  {
    id: 'a-arsiv-gokbey',
    sectorId: 'savunma',
    companyId: 'tusas',
    title: 'GÖKBEY Yerli Motorla Uçtu',
    summary:
      'Özgün helikopter GÖKBEY, TEI tarafından geliştirilen milli TS1400 turboşaft motoruyla ilk uçuşunu gerçekleştirdi.',
    dateLabel: '2023',
    period: 'gecmis',
    isMilestone: true,
    searchTerm: 'GÖKBEY TS1400 ilk uçuş',
  },
  {
    id: 'a-arsiv-siper',
    sectorId: 'savunma',
    companyId: 'aselsan',
    title: 'SİPER Hava Savunma Sistemi Teslim Edildi',
    summary:
      'Yüksek irtifa hava savunma sistemi SİPER’in ilk teslimatları yapılarak katmanlı hava savunmanın üst halkası envantere girdi.',
    dateLabel: '2023',
    period: 'gecmis',
    isMilestone: false,
    searchTerm: 'SİPER teslimat 2023',
  },
  {
    id: 'a-arsiv-kizilelma',
    sectorId: 'savunma',
    companyId: 'baykar',
    title: 'Bayraktar KIZILELMA İlk Uçuşu',
    summary:
      'Jet motorlu insansız savaş uçağı Bayraktar KIZILELMA, 14 Aralık 2022’de ilk uçuşunu tamamlayarak insansız hava muharebesinde yeni bir sınıf açtı.',
    dateLabel: '2022',
    period: 'gecmis',
    isMilestone: true,
    searchTerm: 'Bayraktar KIZILELMA ilk uçuş',
  },
  {
    id: 'a-arsiv-tayfun',
    sectorId: 'savunma',
    companyId: 'roketsan',
    title: 'TAYFUN Balistik Füzesi Test Edildi',
    summary:
      'Türkiye’nin en uzun menzilli yerli balistik füzesi TAYFUN, ilk test atışıyla ülkenin caydırıcılık kabiliyetini yeni bir seviyeye taşıdı.',
    dateLabel: '2022',
    period: 'gecmis',
    isMilestone: true,
    searchTerm: 'Roketsan Tayfun balistik füze test',
  },
  {
    id: 'a-arsiv-tcg-anadolu',
    sectorId: 'savunma',
    companyId: null,
    title: 'TCG Anadolu Envantere Girdi',
    summary:
      'İnsansız hava araçlarını taşıyabilen dünyanın ilk gemisi olarak tasarlanan TCG Anadolu, 2023’te Deniz Kuvvetleri envanterine katıldı.',
    dateLabel: '2023',
    period: 'gecmis',
    isMilestone: false,
    searchTerm: 'TCG Anadolu envanter',
  },
];

/** Bir dönemin arşiv kayıtları; sektör verilirse yalnızca o sektörünkiler. */
export function entriesForPeriod(period: ArchivePeriod, sectorId: SectorId | '' = ''): ArchiveEntry[] {
  return ARCHIVE_ENTRIES.filter(
    (entry) => entry.period === period && (!sectorId || entry.sectorId === sectorId),
  );
}
