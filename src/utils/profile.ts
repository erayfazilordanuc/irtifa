import { createPersistentStore } from './store';
import { isProfileIconId, type ProfileIconId } from '../data/profileIcons';
import { findDepartment, findSector, type DepartmentId, type SectorId } from '../data/sectors';
import type { Tone } from '../components/AppUI';

export type { ProfileIconId };
export { PROFILE_ICON_GROUPS, PROFILE_ICON_IDS, profileIconComponent } from '../data/profileIcons';

// Profil ekranındaki kullanıcı kartı. Sunucuya gitmez, yalnızca cihazda saklanır.
export type Profile = {
  name: string;
  role: string;
  linkedin: string;
  website: string;
  icon: ProfileIconId;
  avatarTone: Tone;
  avatarUri: string;
  /**
   * Hedeflenen sektör (YAPILACAKLAR_İRTİFA Bölüm 00). Kurum listesi, genel
   * sorular, haberler ve yapay zekâ rolü buna göre gelir.
   * `''` = seçilmedi; o hâlde bütün sektörlerin kurumları kullanılır.
   */
  sectorId: SectorId | '';
  /**
   * Mülakatta, günün alan testinde ve teknik soru bankasında kullanılan hedef
   * alan. Seçili sektörün altında bir departman (`sectors.ts`).
   * `''` = seçilmedi; o hâlde teknik içerik gösterilmez, seçime yönlendirilir.
   */
  targetDepartment: DepartmentId | '';
};

const DEFAULTS: Profile = {
  name: '',
  role: '',
  linkedin: '',
  website: '',
  icon: 'userCheck',
  avatarTone: 'blue',
  avatarUri: '',
  sectorId: '',
  targetDepartment: '',
};

export const profileStore = createPersistentStore<Profile>('user-profile', DEFAULTS, (stored) => {
  const value = (stored ?? {}) as Partial<Profile> & { github?: string };
  return {
    ...DEFAULTS,
    ...value,
    // Alan eskiden "github" idi; eski kayıtlar kaybolmasın diye taşınıyor.
    website: value.website ?? value.github ?? '',
    // Kütüphaneden kalkmış ya da bozulmuş bir kimlik ekranı çökertmesin.
    icon: isProfileIconId(value.icon) ? value.icon : DEFAULTS.icon,
    ...hydrateCatalog(value.sectorId, value.targetDepartment),
  };
});

/**
 * Katalog değişirse kaybolmuş bir sektör/departman kimliği kalabilir;
 * "seçilmedi"ye düşürülüyor, yoksa boş havuzla soru seçilmeye çalışılır.
 * Departman sektörün altında anlam kazandığı için ikisi birlikte doğrulanır:
 * sektör seçilmemiş ama departman seçilmişse sektör departmandan türetilir.
 */
function hydrateCatalog(
  sectorId: unknown,
  departmentId: unknown,
): Pick<Profile, 'sectorId' | 'targetDepartment'> {
  const department = findDepartment(typeof departmentId === 'string' ? departmentId : '');
  const sector = findSector(typeof sectorId === 'string' ? sectorId : '');
  if (department && (!sector || sector.id === department.sectorId)) {
    return { sectorId: department.sectorId, targetDepartment: department.id };
  }
  return { sectorId: sector?.id ?? '', targetDepartment: '' };
}

/**
 * Sektörü değiştirir; seçili departman yeni sektöre ait değilse temizlenir.
 * Sektör seçimi her yerden (oryantasyon, Profil, Ayarlar) bununla yapılır.
 */
export function selectSector(sectorId: SectorId | ''): void {
  profileStore.set((prev) => ({
    ...prev,
    sectorId,
    targetDepartment:
      findDepartment(prev.targetDepartment)?.sectorId === sectorId ? prev.targetDepartment : '',
  }));
}

/** Hedef alanı seçer; sektör departmandan türetilir. `''` seçimi kaldırır. */
export function selectDepartment(departmentId: DepartmentId | ''): void {
  const department = findDepartment(departmentId);
  profileStore.set((prev) => ({
    ...prev,
    targetDepartment: department?.id ?? '',
    sectorId: department?.sectorId ?? prev.sectorId,
  }));
}

export function useProfile(): Profile {
  return profileStore.use();
}

export function saveProfile(patch: Partial<Profile>): void {
  profileStore.set((prev) => ({ ...prev, ...patch }));
}

/** Ana ekrandaki karşılamada kullanılan ilk isim; ad girilmemişse boş döner. */
export function firstName(profile: Profile): string {
  return profile.name.trim().split(/\s+/)[0] ?? '';
}

/** Seçilmiş hedef alanın etiketi; seçilmemişse boş döner. */
export function targetDepartmentLabel(profile: Profile): string {
  return findDepartment(profile.targetDepartment)?.label ?? '';
}

/** Seçilmiş sektörün etiketi; seçilmemişse boş döner. */
export function sectorLabel(profile: Profile): string {
  return findSector(profile.sectorId)?.label ?? '';
}

/**
 * Yapay zekâ istemlerine eklenecek bağlam cümlesi.
 * İkisi de boşsa boş döner — "hedefi: ." gibi sakat bir cümle kurulmasın.
 */
export function careerContext(profile: Profile): string {
  const role = profile.role.trim();
  const sector = sectorLabel(profile);
  const department = targetDepartmentLabel(profile);
  return [
    role ? `Kullanıcının kariyer hedefi: ${role}.` : '',
    sector ? `Hedeflediği sektör: ${sector}.` : '',
    department ? `Hedeflediği alan: ${department}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}
