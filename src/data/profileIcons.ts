import type React from 'react';
import {
  Activity,
  AlarmClock,
  Anchor,
  Atom,
  AudioLines,
  AudioWaveform,
  Award,
  BadgeCheck,
  BookOpen,
  Brain,
  BrainCircuit,
  Briefcase,
  Building2,
  CalendarCheck,
  ChartColumn,
  ChartLine,
  CircleUserRound,
  Compass,
  Contact,
  Cpu,
  Crown,
  Droplet,
  Dumbbell,
  Eye,
  Feather,
  FingerprintPattern,
  Flag,
  Flame,
  Footprints,
  Gauge,
  Gem,
  Glasses,
  GraduationCap,
  Hand,
  Handshake,
  Heart,
  HeartPulse,
  Hourglass,
  Infinity as InfinityIcon,
  Key,
  Languages,
  Leaf,
  Library,
  Lightbulb,
  ListChecks,
  Medal,
  Megaphone,
  MessageCircle,
  Mic,
  Milestone,
  Moon,
  Mountain,
  NotebookPen,
  Orbit,
  PenTool,
  Puzzle,
  Quote,
  Radio,
  Repeat,
  Rocket,
  Route,
  Ruler,
  ScrollText,
  Shield,
  Smile,
  Sparkles,
  Speech,
  Sprout,
  Star,
  Sun,
  Sunrise,
  Swords,
  Target,
  Telescope,
  Timer,
  Trophy,
  TrendingUp,
  User,
  UserCheck,
  Volume2,
  Wind,
  Zap,
} from 'lucide-react-native';

// Profil avatarında kullanılabilecek ikon kütüphanesi.
//
// Kimlik (`ProfileIconId`) bu kaydın anahtarlarından türüyor; yani yeni ikon
// eklemek için tek yapılacak iş aşağıdaki nesneye satır eklemek ve onu bir
// gruba koymak. Eski kayıtlar bozulmasın diye ilk beş kimlik
// (user, userCheck, briefcase, award, zap) asla kaldırılmamalı.

export const PROFILE_ICON_COMPONENTS = {
  // — Kişi —
  user: User,
  userCheck: UserCheck,
  circleUser: CircleUserRound,
  smile: Smile,
  contact: Contact,
  fingerprint: FingerprintPattern,
  glasses: Glasses,
  hand: Hand,
  eye: Eye,

  // — Kariyer —
  briefcase: Briefcase,
  building: Building2,
  target: Target,
  trophy: Trophy,
  award: Award,
  medal: Medal,
  badgeCheck: BadgeCheck,
  graduationCap: GraduationCap,
  handshake: Handshake,

  // — Konuşma —
  mic: Mic,
  megaphone: Megaphone,
  messageCircle: MessageCircle,
  speech: Speech,
  audioLines: AudioLines,
  audioWaveform: AudioWaveform,
  radio: Radio,
  volume: Volume2,

  // — Dil & İfade —
  bookOpen: BookOpen,
  feather: Feather,
  penTool: PenTool,
  languages: Languages,
  quote: Quote,
  scrollText: ScrollText,
  library: Library,
  notebookPen: NotebookPen,

  // — Nefes & Beden —
  wind: Wind,
  heartPulse: HeartPulse,
  activity: Activity,
  dumbbell: Dumbbell,
  leaf: Leaf,
  footprints: Footprints,
  sprout: Sprout,
  droplet: Droplet,
  heart: Heart,

  // — Zihin —
  brain: Brain,
  brainCircuit: BrainCircuit,
  lightbulb: Lightbulb,
  puzzle: Puzzle,
  telescope: Telescope,
  atom: Atom,
  orbit: Orbit,
  infinity: InfinityIcon,
  cpu: Cpu,

  // — Alışkanlık & Rutin —
  calendarCheck: CalendarCheck,
  alarmClock: AlarmClock,
  repeat: Repeat,
  listChecks: ListChecks,
  flame: Flame,
  sunrise: Sunrise,
  sun: Sun,
  moon: Moon,
  timer: Timer,

  // — Ölçüm & Yön —
  chartColumn: ChartColumn,
  chartLine: ChartLine,
  trendingUp: TrendingUp,
  gauge: Gauge,
  compass: Compass,
  ruler: Ruler,
  hourglass: Hourglass,
  milestone: Milestone,
  route: Route,

  // — Simgeler —
  mountain: Mountain,
  rocket: Rocket,
  star: Star,
  sparkles: Sparkles,
  anchor: Anchor,
  shield: Shield,
  swords: Swords,
  crown: Crown,
  gem: Gem,
  zap: Zap,
  flag: Flag,
  key: Key,
} satisfies Record<string, React.ComponentType<{ size?: number; color?: string }>>;

export type ProfileIconId = keyof typeof PROFILE_ICON_COMPONENTS;

export type ProfileIconGroup = {
  id: string;
  title: string;
  icons: ProfileIconId[];
};

/** Seçicideki bölümler. Sıra, uygulamanın yedi sütununu izliyor. */
export const PROFILE_ICON_GROUPS: ProfileIconGroup[] = [
  {
    id: 'kisi',
    title: 'Kişi',
    icons: ['user', 'userCheck', 'circleUser', 'smile', 'contact', 'fingerprint', 'glasses', 'hand', 'eye'],
  },
  {
    id: 'kariyer',
    title: 'Kariyer',
    icons: ['briefcase', 'building', 'target', 'trophy', 'award', 'medal', 'badgeCheck', 'graduationCap', 'handshake'],
  },
  {
    id: 'konusma',
    title: 'Konuşma',
    icons: ['mic', 'megaphone', 'messageCircle', 'speech', 'audioLines', 'audioWaveform', 'radio', 'volume'],
  },
  {
    id: 'ifade',
    title: 'Dil & İfade',
    icons: ['bookOpen', 'feather', 'penTool', 'languages', 'quote', 'scrollText', 'library', 'notebookPen'],
  },
  {
    id: 'beden',
    title: 'Nefes & Beden',
    icons: ['wind', 'heartPulse', 'activity', 'dumbbell', 'leaf', 'footprints', 'sprout', 'droplet', 'heart'],
  },
  {
    id: 'zihin',
    title: 'Zihin',
    icons: ['brain', 'brainCircuit', 'lightbulb', 'puzzle', 'telescope', 'atom', 'orbit', 'infinity', 'cpu'],
  },
  {
    id: 'rutin',
    title: 'Alışkanlık & Rutin',
    icons: ['calendarCheck', 'alarmClock', 'repeat', 'listChecks', 'flame', 'sunrise', 'sun', 'moon', 'timer'],
  },
  {
    id: 'olcum',
    title: 'Ölçüm & Yön',
    icons: ['chartColumn', 'chartLine', 'trendingUp', 'gauge', 'compass', 'ruler', 'hourglass', 'milestone', 'route'],
  },
  {
    id: 'simge',
    title: 'Simgeler',
    icons: ['mountain', 'rocket', 'star', 'sparkles', 'anchor', 'shield', 'swords', 'crown', 'gem', 'zap', 'flag', 'key'],
  },
];

export const PROFILE_ICON_IDS = Object.keys(PROFILE_ICON_COMPONENTS) as ProfileIconId[];

export function isProfileIconId(value: unknown): value is ProfileIconId {
  return typeof value === 'string' && value in PROFILE_ICON_COMPONENTS;
}

export function profileIconComponent(id: ProfileIconId) {
  return PROFILE_ICON_COMPONENTS[id];
}
