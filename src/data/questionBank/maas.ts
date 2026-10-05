import type { Question } from '../questions';

// Maaş görüşmesi havuzu — Kriz Masası'ndan farkı baskı değil **pazarlık**
// (YAPILACAKLAR_İRTİFA Bölüm 2.5): aralık belirleme, karşı teklif, sessizlik.
//
// Bu sorular bilgi ölçmüyor; hazırlıksız yakalandığında en çok para kaybettiren
// anları prova ettiriyor.

export const MAAS_QUESTIONS: Question[] = [
  {
    id: 'm-01',
    text: 'Maaş beklentiniz nedir?',
    type: 'maas',
    stressFactor: 'İlk sayıyı söyleyen taraf olmak çoğu zaman aleyhine çalışır.',
    tip: 'Aralık ver ve gerekçelendir; alt ucu gerçekten kabul edeceğin sayı olsun.',
  },
  {
    id: 'm-02',
    text: 'Şu anda ne kadar kazanıyorsunuz?',
    type: 'maas',
    stressFactor: 'Mevcut maaş düşükse teklif ona göre çapalanır.',
    tip: 'Mevcut maaşı değil, rolün piyasa karşılığını ve beklentini konuş.',
  },
  {
    id: 'm-03',
    text: 'Bu bizim bütçemizin üstünde. Rakamı aşağı çekebilir misiniz?',
    type: 'maas',
    stressFactor: 'Kabul etme baskısı ile teklifin kaybedilme korkusu bir arada.',
    tip: 'Hemen inme. Neyin karşılığında ineceğini sor: başlangıç tarihi, unvan, prim, uzaktan çalışma.',
  },
  {
    id: 'm-04',
    text: 'Elinizde başka teklif var mı?',
    type: 'maas',
    stressFactor: 'Abartmak blöf, küçümsemek pazarlık gücünü bırakmak demek.',
    tip: 'Varsa sayı vermeden söyle, yoksa yalan söyleme; ilgini ve zaman çizelgeni belirt.',
  },
  {
    id: 'm-05',
    text: 'Teklifi duyduktan sonra karşı tarafın sustuğunu varsay. Ne söylersin?',
    type: 'maas',
    stressFactor: 'Sessizlik, adayı kendi aleyhine konuşturmak için kullanılan en yaygın yöntem.',
    tip: 'Sen de sus. Düşünmek için süre istemek pazarlığı bozmaz, güçlendirir.',
  },
  {
    id: 'm-06',
    text: 'Maaşı artıramıyoruz ama unvanı yükseltebiliriz. Ne dersiniz?',
    type: 'maas',
    stressFactor: 'Parasal olmayan teklifin gerçek değerini anında hesaplamak gerekir.',
    tip: 'Unvanın bir sonraki maaş görüşmesindeki karşılığını ve yazılı olup olmadığını sor.',
  },
  {
    id: 'm-07',
    text: 'İmzayı bugün atmanızı istiyoruz. Düşünmek için süre isteyebilir misiniz?',
    type: 'maas',
    stressFactor: 'Aceleye getirilen karar, pazarlığın en pahalı anıdır.',
    tip: 'Somut bir tarih vererek süre iste; ilgini açıkça belirt ki acele ile ilgisizlik karışmasın.',
  },
  {
    id: 'm-08',
    text: 'Zam görüşmesinde "bu yıl kimseye zam yok" cevabını aldınız. Konuşmayı nasıl sürdürürsünüz?',
    type: 'maas',
    stressFactor: 'Kapıyı kapatan bir cümleden sonra konuşmaya devam etmek gerekiyor.',
    tip: 'Bu yılın değil, gelecek değerlendirmenin ölçütlerini konuş: neyi yaparsam ne olur.',
  },
];
