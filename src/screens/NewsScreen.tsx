import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Linking } from 'react-native';
import * as rssParser from 'react-native-rss-parser';
import {
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react-native';

import { AppScreen, AppHeader, Surface, RoundButton, toneColor, toneText } from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import {
  companiesForSector,
  companyColor,
  detectCompany,
  getCompany,
  type CompanyId,
} from '../data/companies';
import {
  ARCHIVE_PERIODS,
  entriesForPeriod,
  feedsForSector,
  type ArchiveEntry,
  type ArchivePeriod,
} from '../data/news';
import { findSector } from '../data/sectors';
import { useProfile } from '../utils/profile';
import { formatLongDate } from '../utils/dateUtils';

// Sektörel Gelişmeler.
// "Güncel (Canlı)" sekmesi RSS akışını ağdan çeker; yıl sekmeleri elle derlenmiş
// tarihçeyi gösterir ve çevrimdışı da çalışır.
//
// Sektör koda gömülü değil (YAPILACAKLAR_İRTİFA Bölüm 00): kaynaklar, kurum
// filtreleri ve arşiv kayıtları kullanıcının seçtiği sektörden süzülür; sektör
// seçilmemişse bütün katalog gösterilir.

type PeriodTab = 'live' | ArchivePeriod;
type CompanyFilter = 'all' | CompanyId | 'genel';

type LiveItem = {
  id: string;
  title: string;
  summary: string;
  url?: string;
  publishedAt: Date | null;
  companyId: CompanyId | null;
};

/** RSS açıklamalarındaki etiketleri ve fazla boşlukları temizler. */
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchFeeds(sectorId: string): Promise<LiveItem[]> {
  const results = await Promise.allSettled(
    feedsForSector(sectorId).map(async (url) => {
      const response = await fetch(url, { headers: { Accept: 'application/rss+xml, text/xml' } });
      if (!response.ok) throw new Error(`${url} → HTTP ${response.status}`);
      const text = await response.text();
      return rssParser.parse(text);
    }),
  );

  const items: LiveItem[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const entry of result.value.items ?? []) {
      const title = stripHtml(entry.title ?? '');
      if (!title) continue;

      const key = title.toLocaleLowerCase('tr-TR');
      if (seen.has(key)) continue; // aynı haber iki kaynakta da olabilir
      seen.add(key);

      const summary = stripHtml(entry.description ?? entry.content ?? '');
      const published = entry.published ? new Date(entry.published) : null;

      items.push({
        id: entry.id || `${key}`,
        title,
        summary,
        url: entry.links?.[0]?.url,
        publishedAt: published && !Number.isNaN(published.getTime()) ? published : null,
        companyId: detectCompany(`${title} ${summary}`, sectorId),
      });
    }
  }

  // En yeni haber en üstte.
  return items.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
}

export default function NewsScreen({ navigation }: any) {
  const t = useThemeTokens();
  const profile = useProfile();
  const sectorId = profile.sectorId;
  const sector = findSector(sectorId);
  const companies = React.useMemo(() => companiesForSector(sectorId), [sectorId]);

  const [period, setPeriod] = React.useState<PeriodTab>('live');
  const [company, setCompany] = React.useState<CompanyFilter>('all');

  const [live, setLive] = React.useState<LiveItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchFeeds(sectorId);
      setLive(items);
      if (items.length === 0) {
        setError('Haber akışı boş döndü. İnternet bağlantınızı kontrol edip tekrar deneyin.');
      }
    } catch {
      setError('Canlı akış alınamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [sectorId]);

  React.useEffect(() => {
    if (period === 'live' && live.length === 0 && !loading && !error) load();
  }, [period, live.length, loading, error, load]);

  const matchesCompany = (id: CompanyId | null) =>
    company === 'all' || (company === 'genel' ? id === null : id === company);

  const liveFiltered = live.filter((item) => matchesCompany(item.companyId));
  const archiveFiltered =
    period === 'live'
      ? []
      : entriesForPeriod(period, sectorId).filter((entry) => matchesCompany(entry.companyId));

  return (
    <AppScreen
      header={
        <AppHeader
          title="Sektörel Gelişmeler"
          subtitle={
            period === 'live'
              ? (sector?.news.title ?? 'Canlı haber akışı (RSS)')
              : `${sector?.label ?? 'Sektör'} tarihçesi`
          }
          onBack={() => navigation.goBack()}
          right={
            period === 'live' ? (
              <RoundButton
                icon={<RefreshCw size={18} color={toneColor('blue', t.isLight)} />}
                onPress={load}
                label="Yenile"
              />
            ) : undefined
          }
        />
      }
    >
      {/* Dönem sekmeleri */}
      <FilterRow>
        <FilterChip
          label="Güncel (Canlı)"
          icon={<Calendar size={13} color={period === 'live' ? toneColor('blue', t.isLight) : t.iconColor} />}
          selected={period === 'live'}
          onPress={() => setPeriod('live')}
          soft
        />
        {ARCHIVE_PERIODS.map((item) => (
          <FilterChip
            key={item.id}
            label={item.label}
            icon={
              <Calendar
                size={13}
                color={period === item.id ? toneColor('violet', t.isLight) : t.iconColor}
              />
            }
            selected={period === item.id}
            onPress={() => setPeriod(item.id)}
            soft
            tone="violet"
          />
        ))}
      </FilterRow>

      {/* Kurum filtreleri */}
      <FilterRow>
        <FilterChip
          label="Hepsi"
          selected={company === 'all'}
          onPress={() => setCompany('all')}
          color={toneColor('blue', t.isLight)}
        />
        {companies.map((item) => (
          <FilterChip
            key={item.id}
            label={item.shortName}
            selected={company === item.id}
            onPress={() => setCompany(item.id)}
            color={companyColor(item, t.isLight)}
          />
        ))}
        <FilterChip
          label="Genel"
          selected={company === 'genel'}
          onPress={() => setCompany('genel')}
          color={toneColor('slate', t.isLight)}
        />
      </FilterRow>

      {/* İçerik */}
      {period === 'live' ? (
        loading ? (
          <View className="items-center py-16">
            <ActivityIndicator color={toneColor('blue', t.isLight)} />
            <Text className={`text-[11px] mt-3 ${t.muted}`}>Haber akışı alınıyor…</Text>
          </View>
        ) : error ? (
          <Surface className="mt-3">
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={16} color={toneColor('amber', t.isLight)} />
              <Text className={`text-[13px] font-bold ml-2 ${t.title}`}>Akış alınamadı</Text>
            </View>
            <Text className={`text-[12px] leading-5 ${t.body}`}>{error}</Text>
            <Pressable onPress={load} accessibilityRole="button" className="mt-3">
              <Text className={`text-[12px] font-bold ${toneText('blue', t.isLight)}`}>
                Tekrar dene
              </Text>
            </Pressable>
          </Surface>
        ) : liveFiltered.length === 0 ? (
          <Surface className="mt-3">
            <Text className={`text-[12px] ${t.muted}`}>
              Bu filtreye uyan güncel haber bulunamadı.
            </Text>
          </Surface>
        ) : (
          liveFiltered.map((item) => <LiveCard key={item.id} item={item} />)
        )
      ) : archiveFiltered.length === 0 ? (
        <Surface className="mt-3">
          <Text className={`text-[12px] ${t.muted}`}>Bu dönem için kayıtlı gelişme bulunmuyor.</Text>
        </Surface>
      ) : (
        archiveFiltered.map((entry) => <ArchiveCard key={entry.id} entry={entry} />)
      )}
    </AppScreen>
  );
}

function FilterRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3"
      contentContainerStyle={{ paddingRight: 8 }}
    >
      {children}
    </ScrollView>
  );
}

function FilterChip({
  label,
  icon,
  selected,
  onPress,
  color,
  soft,
  tone = 'blue',
}: {
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  /** Seçiliyken kullanılacak dolgu rengi (kurum filtreleri için). */
  color?: string;
  /** Dönem sekmelerinde olduğu gibi açık tonlu seçim. */
  soft?: boolean;
  tone?: 'blue' | 'violet';
}) {
  const t = useThemeTokens();

  const softSelected = t.isLight
    ? tone === 'blue'
      ? 'bg-blue-50'
      : 'bg-violet-50'
    : tone === 'blue'
      ? 'bg-blue-950'
      : 'bg-violet-950';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-row items-center px-3.5 py-2 rounded-full mr-2 ${
        selected
          ? soft
            ? softSelected
            : ''
          : t.isLight
            ? 'bg-slate-100'
            : 'bg-slate-800'
      }`}
      style={selected && !soft && color ? { backgroundColor: color } : undefined}
    >
      {icon ? <View className="mr-1.5">{icon}</View> : null}
      <Text
        className={`text-[11px] font-bold ${
          selected
            ? soft
              ? tone === 'blue'
                ? toneText('blue', t.isLight)
                : toneText('violet', t.isLight)
              : 'text-white'
            : t.body
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function LiveCard({ item }: { item: LiveItem }) {
  const t = useThemeTokens();
  const company = item.companyId ? getCompany(item.companyId) : null;
  const tagColor = company ? companyColor(company, t.isLight) : toneColor('slate', t.isLight);

  return (
    <Surface className="mt-3">
      <View className="flex-row items-center justify-between mb-2">
        <View
          className={`px-2.5 py-1 rounded-full ${t.isLight ? 'bg-slate-100' : 'bg-slate-800'}`}
        >
          <Text className="text-[10px] font-bold" style={{ color: tagColor }}>
            {company ? company.shortName : 'Genel'}
          </Text>
        </View>
        {item.publishedAt ? (
          <Text className={`text-[10px] font-bold ${t.muted}`}>
            {formatLongDate(item.publishedAt)}
          </Text>
        ) : null}
      </View>

      <Text className={`text-[15px] font-bold leading-6 ${t.title}`}>{item.title}</Text>
      {item.summary ? (
        <Text className={`text-[12px] mt-2 leading-5 ${t.body}`} numberOfLines={3}>
          {item.summary}
        </Text>
      ) : null}

      {item.url ? (
        <Pressable
          onPress={() => Linking.openURL(item.url!).catch(() => {})}
          accessibilityRole="link"
          className={`flex-row items-center mt-3 pt-3 border-t ${t.dividerColor}`}
        >
          <ExternalLink size={14} color={t.iconColor} />
          <Text className={`text-[11px] font-bold uppercase tracking-widest ml-2 ${t.muted}`}>
            Detayları İncele
          </Text>
        </Pressable>
      ) : null}
    </Surface>
  );
}

function ArchiveCard({ entry }: { entry: ArchiveEntry }) {
  const t = useThemeTokens();
  const company = entry.companyId ? getCompany(entry.companyId) : null;
  const tagColor = company ? companyColor(company, t.isLight) : toneColor('slate', t.isLight);

  const research = () => {
    const query = encodeURIComponent(entry.searchTerm);
    Linking.openURL(`https://www.google.com/search?q=${query}`).catch(() => {});
  };

  return (
    <Surface className="mt-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className={`px-2.5 py-1 rounded-full ${t.isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
          <Text className="text-[10px] font-bold" style={{ color: tagColor }}>
            {company ? company.shortName : 'Genel'}
          </Text>
        </View>
        <Text className={`text-[10px] font-bold ${t.muted}`}>{entry.dateLabel}</Text>
      </View>

      <Text className={`text-[15px] font-bold leading-6 ${t.title}`}>{entry.title}</Text>
      <Text className={`text-[12px] mt-2 leading-5 ${t.body}`}>{entry.summary}</Text>

      <View className={`flex-row items-center mt-3 pt-3 border-t ${t.dividerColor}`}>
        {entry.isMilestone ? (
          <View className="flex-row items-center flex-1">
            <CheckCircle2 size={14} color={toneColor('emerald', t.isLight)} />
            <Text
              className={`text-[11px] font-bold uppercase tracking-widest ml-2 ${toneText('emerald', t.isLight)}`}
            >
              TARİHİ DÖNÜM NOKTASI
            </Text>
          </View>
        ) : (
          <View className="flex-1" />
        )}

        <Pressable onPress={research} accessibilityRole="link" className="flex-row items-center">
          <ExternalLink size={14} color={t.iconColor} />
          <Text className={`text-[11px] font-bold uppercase tracking-widest ml-2 ${t.muted}`}>
            Araştır
          </Text>
        </Pressable>
      </View>
    </Surface>
  );
}
