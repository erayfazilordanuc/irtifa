// Sektör kataloğu — YAPILACAKLAR Bölüm 00.
//
// İlke: *sistemi uygulama versin, alanı katalog versin.* Sektör, kurum,
// departman, soru havuzu, haber kaynağı ve yapay zekâ rolü koda gömülü değil,
// bu katalogdan gelir. Kullanıcı sektör ya da kurum **yazmaz**, listeden
// **seçer** (KARARLAR "Kullanıcıdan içerik yazması istenmez").
//
// Hiçbir sektör ayrıcalıklı değil: savunma sanayii kataloğun ilk girdisi,
// varsayılanı değil. Sektör seçilmemişse (`''`) uygulama bütün sektörlerin
// kurumlarıyla çalışır, departmana bağlı içerik seçime yönlendirir.
//
// Kimlikler serbest metin (`string`), birleşim tipi değil: katalog büyüdükçe
// tip tanımı değişmesin, diskteki eski kayıtlar da derlemeyi bozmasın. Diskten
// gelen kimlik her zaman `find*` ile gevşek aranır.

export type SectorId = string;
export type DepartmentId = string;

export type Sector = {
  id: SectorId;
  /** Seçim çiplerinde ve başlıklarda görünen ad. */
  label: string;
  description: string;
  /**
   * Yapay zekâ istemlerinde mülakatçının rolü — "Sen … " ile başlayan cümle.
   * Sektör seçilmemişse `NEUTRAL_INTERVIEWER_ROLE` kullanılır.
   */
  interviewerRole: string;
  /** Haber ekranının alt başlığı ve canlı akış kaynakları. */
  news: {
    title: string;
    feeds: string[];
  };
};

export type Department = {
  id: DepartmentId;
  sectorId: SectorId;
  label: string;
  description: string;
};

export const NEUTRAL_INTERVIEWER_ROLE =
  'Sen Türkiye\'de büyük kurumlarda işe alım mülakatı yürütmüş kıdemli bir mülakat kurulu üyesisin.';

export const SECTORS: Sector[] = [
  {
    id: 'savunma',
    label: 'Savunma Sanayii',
    description: 'Havacılık, elektronik, füze ve yazılım sistemleri',
    interviewerRole:
      'Sen Türk savunma sanayii firmalarında görev yapmış kıdemli bir mülakat kurulu üyesisin.',
    news: {
      title: 'Savunma sanayii haberleri',
      feeds: ['https://www.savunmasanayist.com/feed/', 'https://www.defenceturk.net/feed/'],
    },
  },
  {
    id: 'yazilim',
    label: 'Yazılım & Teknoloji',
    description: 'Ürün şirketleri, e-ticaret, fintek, oyun ve SaaS',
    interviewerRole:
      'Sen Türkiye\'deki teknoloji şirketlerinde yüzlerce işe alım mülakatı yapmış kıdemli bir mühendislik yöneticisisin.',
    news: {
      title: 'Teknoloji ve girişim haberleri',
      feeds: ['https://webrazzi.com/feed/', 'https://shiftdelete.net/feed'],
    },
  },
];

// Departman listesi sektörün altında anlam kazanır (savunmada aerodinamik,
// yazılımda backend). Liste kasıtlı olarak budandı: her departman kendi soru
// havuzunu getiriyor (YAPILACAKLAR Bölüm 3 → "Yerel havuzun büyütülmesi").
export const DEPARTMENTS: Department[] = [
  // ——— Savunma sanayii ———
  { id: 'sv-gomulu', sectorId: 'savunma', label: 'Gömülü Yazılım', description: 'Gerçek zamanlı sistemler, RTOS, güvenlik kritik yazılım' },
  { id: 'sv-elektronik', sectorId: 'savunma', label: 'Elektronik & Donanım', description: 'Kart tasarımı, FPGA, güç elektroniği, EMC' },
  { id: 'sv-rf', sectorId: 'savunma', label: 'RF & Haberleşme', description: 'Anten, radar, telsiz, sinyal işleme' },
  { id: 'sv-kontrol', sectorId: 'savunma', label: 'Kontrol Sistemleri & Otonomi', description: 'Kontrol teorisi, otopilot, seyir ve konum kestirimi' },
  { id: 'sv-aero', sectorId: 'savunma', label: 'Aerodinamik & Akış', description: 'CFD, rüzgâr tüneli, performans analizi' },
  { id: 'sv-mekanik', sectorId: 'savunma', label: 'Mekanik & Yapısal Tasarım', description: 'Yapısal analiz, malzeme, imalata uygun tasarım' },
  { id: 'sv-sistem', sectorId: 'savunma', label: 'Sistem Mühendisliği', description: 'Gereksinim, mimari, entegrasyon, teknoloji olgunluğu' },
  { id: 'sv-goruntu', sectorId: 'savunma', label: 'Görüntü İşleme & Yapay Zekâ', description: 'Hedef tespiti, elektro-optik, gömülü çıkarım' },
  { id: 'sv-test', sectorId: 'savunma', label: 'Test, Doğrulama & Kalite', description: 'Kalifikasyon testleri, doğrulama, konfigürasyon yönetimi' },
  { id: 'sv-yonetim', sectorId: 'savunma', label: 'Proje Yönetimi & İK', description: 'Ekip yönetimi, takvim, gizlilik ve yetkinlik gelişimi' },

  // ——— Yazılım & teknoloji ———
  { id: 'yz-backend', sectorId: 'yazilim', label: 'Backend', description: 'API tasarımı, veritabanları, dağıtık sistemler' },
  { id: 'yz-frontend', sectorId: 'yazilim', label: 'Frontend', description: 'Web arayüzü, performans, erişilebilirlik' },
  { id: 'yz-mobil', sectorId: 'yazilim', label: 'Mobil', description: 'iOS, Android, çapraz platform' },
  { id: 'yz-veri', sectorId: 'yazilim', label: 'Veri & Analitik', description: 'SQL, veri ambarı, metrik ve deney tasarımı' },
  { id: 'yz-ml', sectorId: 'yazilim', label: 'Yapay Zekâ & ML', description: 'Model geliştirme, değerlendirme, üretime alma' },
  { id: 'yz-devops', sectorId: 'yazilim', label: 'DevOps & Altyapı', description: 'CI/CD, konteyner, gözlemlenebilirlik, bulut' },
  { id: 'yz-guvenlik', sectorId: 'yazilim', label: 'Siber Güvenlik', description: 'Uygulama güvenliği, kimlik doğrulama, olay müdahalesi' },
  { id: 'yz-qa', sectorId: 'yazilim', label: 'QA & Test', description: 'Test stratejisi, otomasyon, kalite süreçleri' },
  { id: 'yz-urun', sectorId: 'yazilim', label: 'Ürün Yönetimi & UX', description: 'Önceliklendirme, kullanıcı araştırması, metrikler' },
];

/** Diskten ya da navigasyondan gelen kimlik için gevşek arama. */
export function findSector(id: string | undefined | null): Sector | undefined {
  return SECTORS.find((sector) => sector.id === id);
}

export function findDepartment(id: string | undefined | null): Department | undefined {
  return DEPARTMENTS.find((department) => department.id === id);
}

/**
 * Bir sektörün departmanları. Sektör seçilmemişse (`''`) bütün departmanlar —
 * seçim ekranları sektör başlığıyla gruplayarak gösterir.
 */
export function departmentsForSector(sectorId: SectorId | ''): Department[] {
  return sectorId ? DEPARTMENTS.filter((d) => d.sectorId === sectorId) : DEPARTMENTS;
}

/** Yapay zekâ isteminin ilk cümlesi: seçili sektörün mülakatçı rolü. */
export function interviewerRole(sectorId: SectorId | '' | undefined): string {
  return findSector(sectorId)?.interviewerRole ?? NEUTRAL_INTERVIEWER_ROLE;
}
