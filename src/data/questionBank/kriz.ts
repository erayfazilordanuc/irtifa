import type { Question } from '../questions';

// Kriz Masası havuzu — süre baskılı, karar gerektiren senaryolar.
//
// Mülakatın davranışsal sorularından farkı: burada "ne yaparsın" sorusunun
// arkasında tik tak eden bir sayaç var ve senaryo kötüye gidiyor. Ölçülen şey
// bilgi değil, baskı altında sıralama yapabilmek: önce neyi durdurursun, kime
// haber verirsin, neyi feda edersin.
//
// `sectorId` taşımayan soru her sektörde çıkar.

export const KRIZ_QUESTIONS: Question[] = [
  {
    id: 'k-01',
    text: 'Teslime üç gün kala, üzerinde çalıştığın modülün temel varsayımının yanlış olduğunu fark ettin. Kimseye henüz söylemedin. Şimdi ne yaparsın?',
    type: 'kriz',
    stressFactor: 'Hatanın sahibi sensin ve saklamak kısa vadede daha kolay görünüyor.',
    tip: 'Önce etkiyi ölç (neyi bozuyor, neyi bozmuyor), sonra haber ver. Seçenekleri yanında götür.',
  },
  {
    id: 'k-02',
    text: 'Canlı sistemde hata var, müşteri arıyor, ekip arkadaşın izinde ve kod yalnızca onun bildiği bir yerde. İlk on dakikada ne yaparsın?',
    type: 'kriz',
    stressFactor: 'Aynı anda teknik müdahale ve iletişim yönetmek gerekiyor.',
    tip: 'Durdurma/azaltma önce, kök neden sonra. Kimin neyi beklediğini açıkça söyle.',
  },
  {
    id: 'k-03',
    text: 'Yöneticin, senin teknik olarak yanlış bulduğun bir çözümü bugün uygulamanı istiyor. Gerekçesi takvim. Ne yaparsın?',
    type: 'kriz',
    stressFactor: 'Hiyerarşi ile teknik sorumluluk çatışıyor; iki uçta da kötü cevap var.',
    tip: 'İtirazını riskin büyüklüğüyle ölç; yazılı not bırak, kararı sahiplen ya da yükselt.',
  },
  {
    id: 'k-04',
    text: 'Bir testi geçmek için ölçüm koşullarını değiştirmen öneriliyor. Sonuç "geçer" olacak ama gerçeği yansıtmayacak. Ne yaparsın?',
    type: 'kriz',
    stressFactor: 'Etik sınır ile ekip baskısı aynı cümlede duruyor.',
    tip: 'Kaydı ve koşulu ayır: ölçümü değiştirmeden raporlayıp kararı yetkiliye bırakabilirsin.',
  },
  {
    id: 'k-05',
    text: 'Müşteri sunumunun ortasında demo çöktü ve salonda on kişi var. Sonraki altmış saniyede ne yaparsın?',
    type: 'kriz',
    stressFactor: 'Teknik sorun değil, sahne yönetimi sınanıyor; sessizlik en kötü seçenek.',
    tip: 'Hatayı sahiplen, yedek anlatıya geç, somut bir takip sözü ver.',
  },
  {
    id: 'k-06',
    text: 'Ekipteki iki kişi senin hakemliğini istiyor; biri hızlı çözüm, diğeri doğru çözüm diyor ve ikisi de haklı. Kararı nasıl verirsin?',
    type: 'kriz',
    stressFactor: 'Kazanan-kaybeden çıkarmadan karar vermek gerekiyor.',
    tip: 'Kararı kişiden ölçüte taşı: hangi koşulda hangi çözüm, geri dönüş maliyeti ne.',
  },
  {
    id: 'k-07',
    text: 'Yaptığın bir değişiklik yüzünden veri kaybı yaşandığını yeni öğrendin. Henüz kimse fark etmedi. İlk hamlen ne?',
    type: 'kriz',
    stressFactor: 'Dürüstlüğün bedeli anında, saklamanın bedeli gecikmeli.',
    tip: 'Kaybın sınırını belirle, kurtarma yolunu araştır, aynı saat içinde bildir.',
  },
  {
    id: 'k-08',
    text: 'Projenin takvimi üçte bire indirildi ve kapsam aynı kaldı. Yönetime ne söylersin?',
    type: 'kriz',
    stressFactor: '"Olmaz" demeden gerçeği söylemek gerekiyor.',
    tip: 'Kapsam, kalite ve takvimden hangisinin esneyeceğini sayıyla göster; seçeneği yönetime bırak.',
  },
];
