import type { SectorId } from './sectors';

// Mülakat simülasyonunun hedef kurumları — sektör kataloğunun parçası
// (YAPILACAKLAR Bölüm 00, `sectors.ts`). Her kurum bir sektöre bağlı; hiçbiri
// ayrıcalıklı değil.
// Renkler hem çip seçimlerinde hem haber etiketlerinde kullanılır; koyu temada `colorDark` geçerli.

/** Serbest kimlik: katalog büyüdükçe tip değişmesin. Diskten gelen kimlik `findCompany` ile aranır. */
export type CompanyId = string;

export type Company = {
  id: CompanyId;
  sectorId: SectorId;
  /** Çiplerde görünen büyük harfli ad. */
  name: string;
  /** Haber filtrelerinde görünen okunabilir ad. */
  shortName: string;
  tagline: string;
  focus: string;
  color: string;
  colorDark: string;
  /** Haber akışında bu kuruma ait içeriği yakalamak için aranan sözcükler. */
  keywords: string[];
};

export const COMPANIES: Company[] = [
  {
    id: 'roketsan',
    sectorId: 'savunma',
    name: 'ROKETSAN',
    shortName: 'Roketsan',
    tagline: 'Roket ve füze sistemleri',
    focus: 'Balistik füzeler, güdüm kiti, hipersonik sistemler',
    color: '#16a34a',
    colorDark: '#22c55e',
    keywords: ['roketsan', 'tayfun', 'cakir', 'çakır', 'sungur', 'karaok'],
  },
  {
    id: 'aselsan',
    sectorId: 'savunma',
    name: 'ASELSAN',
    shortName: 'ASELSAN',
    tagline: 'Haberleşme ve elektronik harp',
    focus: 'Radar, elektro-optik, elektronik harp, komuta kontrol',
    color: '#2563eb',
    colorDark: '#3b82f6',
    keywords: ['aselsan', 'korkut', 'gokdeniz', 'gökdeniz', 'siper', 'redet'],
  },
  {
    id: 'baykar',
    sectorId: 'savunma',
    name: 'BAYKAR',
    shortName: 'Baykar',
    tagline: 'İnsansız hava sistemleri',
    focus: 'SİHA, otonom uçuş kontrol, görev yükü entegrasyonu',
    color: '#0d9488',
    colorDark: '#14b8a6',
    keywords: ['baykar', 'bayraktar', 'akinci', 'akıncı', 'kizilelma', 'kızılelma', 'tb2', 'tb3'],
  },
  {
    id: 'tusas',
    sectorId: 'savunma',
    name: 'TUSAŞ',
    shortName: 'TUSAŞ',
    tagline: 'Hava platformları',
    focus: 'Muharip uçak, helikopter, uydu ve aviyonik',
    color: '#1e3a8a',
    colorDark: '#1d4ed8',
    keywords: ['tusas', 'tusaş', 'tai', 'kaan', 'hurjet', 'hürjet', 'gokbey', 'gökbey', 'anka'],
  },
  {
    id: 'havelsan',
    sectorId: 'savunma',
    name: 'HAVELSAN',
    shortName: 'HAVELSAN',
    tagline: 'Yazılım ve simülasyon',
    focus: 'Savaş yönetim sistemleri, simülatör, siber güvenlik',
    color: '#e11d48',
    colorDark: '#f43f5e',
    keywords: ['havelsan', 'advent', 'barkan', 'baha'],
  },

  // ——— Yazılım & teknoloji ———
  {
    id: 'trendyol',
    sectorId: 'yazilim',
    name: 'TRENDYOL',
    shortName: 'Trendyol',
    tagline: 'E-ticaret platformu',
    focus: 'Yüksek trafikli dağıtık sistemler, öneri sistemleri, lojistik yazılımı',
    color: '#ea580c',
    colorDark: '#fb923c',
    keywords: ['trendyol'],
  },
  {
    id: 'hepsiburada',
    sectorId: 'yazilim',
    name: 'HEPSIBURADA',
    shortName: 'Hepsiburada',
    tagline: 'E-ticaret ve fintek',
    focus: 'Pazar yeri altyapısı, ödeme sistemleri, veri platformu',
    color: '#c2410c',
    colorDark: '#f97316',
    keywords: ['hepsiburada', 'hepsipay'],
  },
  {
    id: 'getir',
    sectorId: 'yazilim',
    name: 'GETİR',
    shortName: 'Getir',
    tagline: 'Hızlı teslimat',
    focus: 'Gerçek zamanlı sipariş, rota optimizasyonu, mobil uygulama',
    color: '#7c3aed',
    colorDark: '#a78bfa',
    keywords: ['getir'],
  },
  {
    id: 'insider',
    sectorId: 'yazilim',
    name: 'INSIDER',
    shortName: 'Insider',
    tagline: 'Pazarlama teknolojisi (SaaS)',
    focus: 'Kişiselleştirme, büyük veri işleme, çok kiracılı altyapı',
    color: '#0f766e',
    colorDark: '#2dd4bf',
    keywords: ['insider', 'useinsider'],
  },
  {
    id: 'dreamgames',
    sectorId: 'yazilim',
    name: 'DREAM GAMES',
    shortName: 'Dream Games',
    tagline: 'Mobil oyun',
    focus: 'Oyun istemcisi, canlı operasyon, performans ve analitik',
    color: '#db2777',
    colorDark: '#f472b6',
    keywords: ['dream games', 'royal match'],
  },
  {
    id: 'garantibbva',
    sectorId: 'yazilim',
    name: 'GARANTİ BBVA TEKNOLOJİ',
    shortName: 'Garanti BBVA Teknoloji',
    tagline: 'Bankacılık teknolojisi',
    focus: 'Mobil bankacılık, ödeme altyapısı, güvenlik ve uyum',
    color: '#0369a1',
    colorDark: '#38bdf8',
    keywords: ['garanti bbva', 'garanti bankası'],
  },
];

/** Bir sektörün kurumları; sektör seçilmemişse (`''`) bütün kurumlar. */
export function companiesForSector(sectorId: SectorId | ''): Company[] {
  return sectorId ? COMPANIES.filter((c) => c.sectorId === sectorId) : COMPANIES;
}

export function getCompany(id: CompanyId): Company {
  const company = COMPANIES.find((c) => c.id === id);
  if (!company) throw new Error(`Bilinmeyen kurum: ${id}`);
  return company;
}

/**
 * Diskten gelen kimlikler için gevşek arama.
 *
 * `getCompany` bilinmeyen kimlikte fırlatıyor; kod içinden gelen kimlikler için
 * doğru davranış bu. Ama mülakat geçmişi diskte duruyor ve kurum listesi
 * değişebilir (katalog — YAPILACAKLAR Bölüm 00). O zaman
 * eski kayıtlardaki kimlik listede bulunamaz; fırlatma tüm uygulamayı
 * düşürürdü, çünkü ErrorBoundary kökte duruyor. Kayıtlı değerlerle bu kullanılır.
 */
export function findCompany(id: string): Company | undefined {
  return COMPANIES.find((c) => c.id === id);
}

/** Kurum rengini aktif temaya göre verir. */
export function companyColor(company: Company, isLight: boolean): string {
  return isLight ? company.color : company.colorDark;
}

/**
 * Serbest metinde (haber başlığı/özeti) hangi kurumun geçtiğini bulur.
 * Hiçbiri geçmiyorsa null döner — haber "Genel" olarak etiketlenir.
 */
export function detectCompany(text: string, sectorId: SectorId | '' = ''): CompanyId | null {
  const haystack = text.toLocaleLowerCase('tr-TR');
  for (const company of companiesForSector(sectorId)) {
    if (company.keywords.some((keyword) => haystack.includes(keyword))) {
      return company.id;
    }
  }
  return null;
}
