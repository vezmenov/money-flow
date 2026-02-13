export type IconName = 'home' | 'categories' | 'dashboard' | 'plus' | 'close' | 'download';

type IconDef = {
  viewBox: string;
  paths: string[];
};

export const ICONS: Record<IconName, IconDef> = {
  home: {
    viewBox: '0 0 24 24',
    paths: [
      'M3 10.5 12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 21z',
      'M9.5 22.5V14h5v8.5',
    ],
  },
  categories: {
    viewBox: '0 0 24 24',
    paths: [
      'M20 10V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4',
      'M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
      'M8 7h8',
    ],
  },
  dashboard: {
    viewBox: '0 0 24 24',
    paths: [
      'M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v14A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5z',
      'M8 17v-6',
      'M12 17v-9',
      'M16 17v-4',
    ],
  },
  plus: {
    viewBox: '0 0 24 24',
    paths: ['M12 5v14', 'M5 12h14'],
  },
  close: {
    viewBox: '0 0 24 24',
    paths: ['M6 6l12 12', 'M18 6 6 18'],
  },
  download: {
    viewBox: '0 0 24 24',
    paths: ['M12 3v11', 'M7 11l5 5 5-5', 'M5 21h14'],
  },
};
