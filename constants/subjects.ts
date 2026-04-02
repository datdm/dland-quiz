export interface SubjectConfig {
  name: string;
  icon: string;
  color: string;
  levels: string[];
}

export const SUBJECTS_CONFIG: SubjectConfig[] = [
  {
    name: 'JLPT',
    icon: '🇯🇵',
    color: 'text-red-300 border-red-700/50 bg-red-900/30',
    levels: ['N1', 'N2', 'N3', 'N4', 'N5'],
  },
  {
    name: 'TOEIC',
    icon: '🇺🇸',
    color: 'text-blue-300 border-blue-700/50 bg-blue-900/30',
    levels: ['900+', '750+', '600+', '450+', '300+'],
  },
  {
    name: 'English',
    icon: '🌐',
    color: 'text-sky-300 border-sky-700/50 bg-sky-900/30',
    levels: ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'],
  },
  {
    name: 'Math',
    icon: '📐',
    color: 'text-green-300 border-green-700/50 bg-green-900/30',
    levels: ['Advanced', 'Intermediate', 'Basic'],
  },
  {
    name: 'Khác',
    icon: '📚',
    color: 'text-purple-300 border-purple-700/50 bg-purple-900/30',
    levels: ['Advanced', 'Intermediate', 'Basic'],
  },
];

export const ALL_SUBJECT_NAMES = ['Tất cả', ...SUBJECTS_CONFIG.map(s => s.name)];

export function getSubjectConfig(name: string): SubjectConfig | undefined {
  return SUBJECTS_CONFIG.find(s => s.name === name);
}

export const LEVEL_COLORS: Record<string, string> = {
  N1: 'bg-red-900/50 text-red-300 border-red-700/50',
  N2: 'bg-orange-900/50 text-orange-300 border-orange-700/50',
  N3: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
  N4: 'bg-green-900/50 text-green-300 border-green-700/50',
  N5: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
  'C2': 'bg-violet-900/50 text-violet-300 border-violet-700/50',
  'C1': 'bg-purple-900/50 text-purple-300 border-purple-700/50',
  'B2': 'bg-blue-900/50 text-blue-300 border-blue-700/50',
  'B1': 'bg-teal-900/50 text-teal-300 border-teal-700/50',
  'A2': 'bg-green-900/50 text-green-300 border-green-700/50',
  'A1': 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
  '900+': 'bg-amber-900/50 text-amber-300 border-amber-700/50',
  '750+': 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
  '600+': 'bg-lime-900/50 text-lime-300 border-lime-700/50',
  '450+': 'bg-teal-900/50 text-teal-300 border-teal-700/50',
  '300+': 'bg-sky-900/50 text-sky-300 border-sky-700/50',
  'Advanced': 'bg-red-900/50 text-red-300 border-red-700/50',
  'Intermediate': 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
  'Basic': 'bg-green-900/50 text-green-300 border-green-700/50',
};
