import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Copy, Check, ClipboardList } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import {
  AppScreen,
  AppHeader,
  Surface,
  SectionLabel,
  Badge,
  ActionButton,
  EmptyState,
  toneColor,
  toneSoft,
  toneText,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import {
  updateApplication,
  useApplications,
  STAGE_META,
  type Application,
} from '../utils/applications';
import { firstName, useProfile } from '../utils/profile';

// Mülakat sonrası takip — YAPILACAKLAR_İRTİFA Bölüm 2.5.
//
// İki iş bir arada: (1) teşekkür mesajı şablonu, (2) öz-değerlendirme formu.
// İkisi de başvuru takibindeki ilgili kayda bağlanıyor — ayrı bir "takip"
// deposu kurulmuyor, çünkü takip başvurunun bir alanı, kendi başına bir kayıt
// değil.
//
// Şablon hazır geliyor ve kopyalanıyor; uygulama e-posta göndermiyor. Gönderme
// işi kullanıcının kendi posta uygulamasında kalıyor: adres, imza ve gönderim
// izni bizim tarafımızda tutulacak şeyler değil.

/** Öz-değerlendirmede sorulanlar — boş kutu yerine sorular (KARARLAR). */
const REVIEW_PROMPTS = [
  'Hangi soruya en kötü cevabı verdin, neden?',
  'Hazırlıklı yakalandığın an hangisiydi?',
  'Sormayı unuttuğun soru var mı?',
  'Bir dahakine neyi farklı yapacaksın?',
];

function thankYouTemplate(application: Application, name: string): string {
  const contact = application.companyName;
  return [
    `Merhaba,`,
    ``,
    `Bugün ${contact} ekibiyle ${application.position || 'pozisyon'} görüşmesi için ayırdığınız zamana teşekkür ederim.`,
    `Görüşmede konuştuğumuz konular ilgimi daha da artırdı; özellikle anlattığınız çalışma biçimi benim aradığım yere çok yakın.`,
    ``,
    `Sürecin sonraki adımlarını memnuniyetle beklerim. İhtiyaç duyduğunuz ek bir bilgi olursa yazmanız yeterli.`,
    ``,
    `İyi çalışmalar,`,
    name || 'Adınız',
  ].join('\n');
}

export default function FollowUpScreen({ navigation }: any) {
  const t = useThemeTokens();
  const profile = useProfile();
  const applications = useApplications();

  // Takip, mülakat aşamasına gelmiş başvurular için anlamlı; sonuçlananlar da
  // listede kalıyor ki öz-değerlendirme sonradan yazılabilsin.
  const relevant = applications.filter((item) => item.stage !== 'hazirlik');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = relevant.find((item) => item.id === selectedId) ?? relevant[0] ?? null;

  const [copied, setCopied] = React.useState(false);
  const [review, setReview] = React.useState('');

  // Seçim değişince form o kaydın kendi notunu gösterir.
  React.useEffect(() => {
    setReview(selected?.selfReview ?? '');
    setCopied(false);
  }, [selected?.id, selected?.selfReview]);

  const copyTemplate = async () => {
    if (!selected) return;
    await Clipboard.setStringAsync(thankYouTemplate(selected, firstName(profile)));
    setCopied(true);
    updateApplication(selected.id, { followUpSent: true });
  };

  return (
    <AppScreen
      header={
        <AppHeader
          title="Mülakat Sonrası Takip"
          subtitle="Teşekkür mesajı ve öz-değerlendirme."
          onBack={() => navigation.goBack()}
        />
      }
      footer={
        selected ? (
          <ActionButton
            label="Değerlendirmeyi kaydet"
            onPress={() => {
              updateApplication(selected.id, { selfReview: review });
              navigation.goBack();
            }}
            icon={<Check size={16} color="#ffffff" />}
          />
        ) : undefined
      }
    >
      {relevant.length === 0 ? (
        <View className="mt-6">
          <EmptyState message="Takip edilecek başvuru yok. Başvuru Takibi'ne bir kayıt ekleyip aşamasını 'Başvuruldu' ya da sonrası yaptığında burada görünür." />
          <View className="mt-3">
            <ActionButton
              label="Başvuru Takibi'ni aç"
              variant="soft"
              onPress={() => navigation.navigate('Applications')}
              icon={<ClipboardList size={16} color={toneColor('blue', t.isLight)} />}
            />
          </View>
        </View>
      ) : null}

      {relevant.length > 0 && selected ? (
        <>
          <View className="mt-1">
            <SectionLabel>BAŞVURU</SectionLabel>
          </View>
          <View className="flex-row flex-wrap">
            {relevant.map((item) => {
              const isSelected = item.id === selected.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedId(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.companyName}, ${STAGE_META[item.stage].label}`}
                  accessibilityState={{ selected: isSelected }}
                  className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                    isSelected
                      ? `${toneSoft('amber', t.isLight)} border-transparent`
                      : t.cardBorder
                  }`}
                >
                  <Text
                    className={`text-[12px] font-bold ${
                      isSelected ? toneText('amber', t.isLight) : t.muted
                    }`}
                  >
                    {item.companyName}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Surface className="mt-2">
            <View className="flex-row items-center">
              <Text className={`text-[13px] font-bold ${t.title}`}>Teşekkür mesajı</Text>
              {selected.followUpSent ? (
                <View className="ml-2">
                  <Badge label="Kopyalandı" tone="emerald" />
                </View>
              ) : null}
            </View>
            <Text className={`text-[12px] mt-2 leading-5 ${t.body}`}>
              {thankYouTemplate(selected, firstName(profile))}
            </Text>
            <View className="mt-3">
              <ActionButton
                label={copied ? 'Panoya kopyalandı' : 'Mesajı kopyala'}
                tone="amber"
                variant="soft"
                onPress={copyTemplate}
                icon={
                  copied ? (
                    <Check size={16} color={toneColor('amber', t.isLight)} />
                  ) : (
                    <Copy size={16} color={toneColor('amber', t.isLight)} />
                  )
                }
              />
            </View>
            <Text className={`text-[11px] mt-2 ${t.muted}`}>
              Görüşmeden sonraki 24 saat içinde gönder. Mesajı kendi posta uygulamanda
              gönderiyorsun; uygulama senin adına e-posta göndermez.
            </Text>
          </Surface>

          <View className="mt-4">
            <SectionLabel>ÖZ-DEĞERLENDİRME</SectionLabel>
          </View>
          <Surface>
            {REVIEW_PROMPTS.map((prompt) => (
              <Text key={prompt} className={`text-[12px] mb-1.5 leading-5 ${t.body}`}>
                • {prompt}
              </Text>
            ))}
            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder="Mülakat hâlâ tazeyken yaz; bir hafta sonra hatırlamıyorsun."
              placeholderTextColor={t.isLight ? '#94a3b8' : '#64748b'}
              multiline
              textAlignVertical="top"
              className={`rounded-2xl px-4 py-3 mt-2 text-[13px] border ${
                t.isLight
                  ? 'bg-slate-100 text-slate-900 border-transparent'
                  : 'bg-[#141417] text-white border-[#2e2e33]'
              }`}
              style={{ minHeight: 160 }}
            />
          </Surface>
        </>
      ) : null}
    </AppScreen>
  );
}
