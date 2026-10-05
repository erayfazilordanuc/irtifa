import { createPersistentStore } from './store';
import { readJson, writeJson } from './storage';
import type { DailyModuleKey, TimeOfDay } from './dailyPracticeSettings';

// İlk açılış oryantasyonu (YAPILACAKLAR Bölüm 0.1).
//
// Ayrı depo: `dailyPracticeSettings` modül ayarlarını tutuyor; kullanıcının
// hedefleri, günlük taahhüdü ve oryantasyonun durumu modül ayarı değil.
// Kararlar ve gerekçeleri KARARLAR.md → "İlk açılış oryantasyonu".

export type OnboardingGoal = 'konusma' | 'nefes' | 'zihin' | 'kariyer';
export type DailyMinutes = 3 | 5 | 10;
export type ReminderSlot = 'sabah' | 'ogle' | 'aksam' | 'yok';

export type OnboardingState = {
  completed: boolean;
  /** ISO zaman damgası. Eski kullanıcı için otomatik geçildiyse boş. */
  completedAt?: string;
  /** Seçim sırası öncelik sırasıdır. */
  goals: OnboardingGoal[];
  dailyMinutes: DailyMinutes;
  /**
   * Süreyi kullanıcı gerçekten seçti mi. Seçmediyse (oryantasyonu atlayan ya da
   * uygulamayı önceden kullanan biri) Bugün listesi bütçeye göre kısaltılmaz —
   * varsayılan bir değer yüzünden liste sessizce kısalmasın.
   */
  dailyMinutesChosen: boolean;
  reminderSlot: ReminderSlot;
  /** Giriş ekranındaki "hızlı tur" kartı kapatıldı mı. */
  tourDismissed: boolean;
};

export const ONBOARDING_DEFAULTS: OnboardingState = {
  completed: false,
  goals: [],
  dailyMinutes: 5,
  dailyMinutesChosen: false,
  reminderSlot: 'yok',
  tourDismissed: false,
};

export const GOAL_ORDER: OnboardingGoal[] = ['konusma', 'nefes', 'zihin', 'kariyer'];

export const GOAL_META: Record<
  OnboardingGoal,
  {
    title: string;
    subtitle: string;
    /** Bugün listesinde öne alınacak günlük pratik modülleri. */
    modules: DailyModuleKey[];
    /** Atölye sekmesindeki istasyonun kimliği (WorkshopScreen → `Station.id`). */
    pillarId: string;
  }
> = {
  konusma: {
    title: 'Konuşma & Diksiyon',
    subtitle: 'Artikülasyon, tekerleme, dolgu kelimeleri azaltma',
    modules: ['speech'],
    pillarId: 'konusma',
  },
  nefes: {
    title: 'Nefes & Denge',
    subtitle: 'Diyafram nefesi, sakinleşme',
    modules: ['diaphragm'],
    pillarId: 'nefes',
  },
  zihin: {
    title: 'Zihin & Odak',
    subtitle: 'Hafıza, dikkat, mantık alıştırmaları',
    modules: [],
    pillarId: 'zihin',
  },
  kariyer: {
    title: 'Kariyer & Mülakat',
    subtitle: 'Mülakat pratiği ve hazırlık',
    modules: [],
    pillarId: 'kariyer',
  },
};

export const REMINDER_SLOTS: Record<Exclude<ReminderSlot, 'yok'>, { label: string; time: TimeOfDay }> = {
  sabah: { label: 'Sabah', time: { hour: 8, minute: 30 } },
  ogle: { label: 'Öğle', time: { hour: 12, minute: 30 } },
  aksam: { label: 'Akşam', time: { hour: 20, minute: 30 } },
};

/** Hedef seçilmemişken Bugün listesinin sırası — DailyPracticeCard'ın mevcut sırası. */
const DEFAULT_MODULE_ORDER: DailyModuleKey[] = ['diaphragm', 'speech'];

/** Hedeflerin modülleri seçim sırasıyla önde, kalanlar varsayılan sırayla arkada. */
export function moduleOrderForGoals(goals: readonly OnboardingGoal[]): DailyModuleKey[] {
  const ordered: DailyModuleKey[] = [];
  for (const goal of goals) {
    for (const module of GOAL_META[goal].modules) {
      if (!ordered.includes(module)) ordered.push(module);
    }
  }
  for (const module of DEFAULT_MODULE_ORDER) {
    if (!ordered.includes(module)) ordered.push(module);
  }
  return ordered;
}

const STORAGE_KEY = 'onboarding';

function isGoal(value: unknown): value is OnboardingGoal {
  return typeof value === 'string' && value in GOAL_META;
}

/**
 * Uygulamayı daha önce kullanmış biri mi? Diğer depoların anahtarları doğrudan
 * okunuyor ki bu modül onlara bağımlı olmasın.
 */
function hasExistingUsage(): boolean {
  const progress = readJson<{ modules?: Record<string, { totalSessions?: number } | undefined> } | null>(
    'daily-practice-progress',
    null,
  );
  if (progress?.modules && Object.values(progress.modules).some((m) => (m?.totalSessions ?? 0) > 0)) {
    return true;
  }
  const interviews = readJson<{ sessions?: unknown[] } | null>('interview-history', null);
  if ((interviews?.sessions?.length ?? 0) > 0) return true;
  const exercises = readJson<{ logs?: unknown[] } | null>('exercise-history', null);
  if ((exercises?.logs?.length ?? 0) > 0) return true;
  const profile = readJson<{ name?: string } | null>('user-profile', null);
  return typeof profile?.name === 'string' && profile.name.trim().length > 0;
}

function hydrate(stored: unknown): OnboardingState {
  if (!stored || typeof stored !== 'object') {
    // Kayıt yok. Uygulamayı zaten kullanan biri oryantasyonla karşılaşmasın.
    return hasExistingUsage()
      ? { ...ONBOARDING_DEFAULTS, completed: true, tourDismissed: true }
      : ONBOARDING_DEFAULTS;
  }
  const v = stored as Partial<Record<keyof OnboardingState, unknown>>;
  const goals = Array.isArray(v.goals) ? v.goals.filter(isGoal) : [];
  return {
    completed: v.completed === true,
    completedAt: typeof v.completedAt === 'string' ? v.completedAt : undefined,
    goals: [...new Set(goals)],
    dailyMinutes: v.dailyMinutes === 3 || v.dailyMinutes === 10 ? v.dailyMinutes : 5,
    dailyMinutesChosen: v.dailyMinutesChosen === true,
    reminderSlot:
      v.reminderSlot === 'sabah' || v.reminderSlot === 'ogle' || v.reminderSlot === 'aksam'
        ? v.reminderSlot
        : 'yok',
    tourDismissed: v.tourDismissed === true,
  };
}

const hadRecord = readJson<unknown>(STORAGE_KEY, null) !== null;

export const onboardingStore = createPersistentStore<OnboardingState>(
  STORAGE_KEY,
  ONBOARDING_DEFAULTS,
  hydrate,
);

// "Eski kullanıcı mı" kararı ilk açılışta bir kez verilip hemen kaydediliyor.
// Kaydedilmeseydi oryantasyonu yarıda bırakan yeni biri — ısınmada bir egzersiz
// yapıp çıktıysa — bir sonraki açılışta eski kullanıcı sayılıp akışı hiç
// bitirmeden geçerdi.
if (!hadRecord) writeJson(STORAGE_KEY, onboardingStore.get());

export function useOnboarding(): OnboardingState {
  return onboardingStore.use();
}

/** Adımlar ilerledikçe seçimleri kaydeder; akış yarıda kalsa da seçimler durur. */
export function updateOnboarding(patch: Partial<Omit<OnboardingState, 'completed' | 'completedAt'>>): void {
  onboardingStore.set((prev) => ({ ...prev, ...patch, ...chosenPatch(patch) }));
}

/** Süre bu çağrıda verildiyse "seçildi" damgasını da basar. */
function chosenPatch(
  patch: Partial<Omit<OnboardingState, 'completed' | 'completedAt'>>,
): { dailyMinutesChosen?: true } {
  return patch.dailyMinutes !== undefined ? { dailyMinutesChosen: true } : {};
}

export function completeOnboarding(patch: Partial<Omit<OnboardingState, 'completed' | 'completedAt'>> = {}): void {
  onboardingStore.set((prev) => ({
    ...prev,
    ...patch,
    ...chosenPatch(patch),
    completed: true,
    completedAt: new Date().toISOString(),
  }));
}

/** Ayarlar → "Oryantasyonu yeniden göster". Seçimler korunur, akış baştan açılır. */
export function resetOnboarding(): void {
  onboardingStore.set((prev) => ({ ...prev, completed: false, tourDismissed: false }));
}

export function dismissTour(): void {
  onboardingStore.set((prev) => ({ ...prev, tourDismissed: true }));
}
