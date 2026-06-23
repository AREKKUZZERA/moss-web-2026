import { create } from 'zustand';

export type ThemeVars = {
  '--bg': string;
  '--bg-deep': string;
  '--s1': string;
  '--s2': string;
  '--s3': string;
  '--s4': string;
  '--s5': string;
  '--b1': string;
  '--b2': string;
  '--b3': string;
  '--acc': string;
  '--acc-d': string;
  '--acc-g': string;
  '--acc-l': string;
  '--acc-2': string;
  '--acc-2-d': string;
  '--grn': string;
  '--grn-d': string;
  '--red': string;
  '--red-d': string;
  '--txt': string;
  '--txt2': string;
  '--mut': string;
  '--radius-xs': string;
  '--radius-sm': string;
  '--radius-md': string;
  '--radius': string;
  '--radius-l': string;
  '--radius-round': string;
};

export const DEFAULT_THEME: ThemeVars = {
  '--bg': '#191817',
  '--bg-deep': '#0b0a0a',
  '--s1': '#211f1e',
  '--s2': '#262321',
  '--s3': '#2d2927',
  '--s4': '#36312e',
  '--s5': '#443d39',
  '--b1': 'rgba(255,255,255,0.055)',
  '--b2': 'rgba(255,255,255,0.10)',
  '--b3': 'rgba(255,255,255,0.17)',
  '--acc': '#f23987',
  '--acc-d': 'rgba(242,57,135,0.14)',
  '--acc-g': 'rgba(242,57,135,0.26)',
  '--acc-l': '#ff79b0',
  '--acc-2': '#7dd3fc',
  '--acc-2-d': 'rgba(125,211,252,0.12)',
  '--grn': '#65d6a6',
  '--grn-d': 'rgba(101,214,166,0.12)',
  '--red': '#f26b6b',
  '--red-d': 'rgba(242,107,107,0.12)',
  '--txt': '#f1eee9',
  '--txt2': '#b8b0aa',
  '--mut': '#7b716b',
  '--radius-xs': '3px',
  '--radius-sm': '6px',
  '--radius-md': '7px',
  '--radius': '8px',
  '--radius-l': '14px',
  '--radius-round': '50%',
};

type ThemeStore = {
  theme: ThemeVars;
  setVar: (key: keyof ThemeVars, value: string) => void;
  importTheme: (theme: Partial<ThemeVars>) => void;
  reset: () => void;
};

function loadTheme(): ThemeVars {
  try {
    const saved = localStorage.getItem('moss-theme');
    return saved ? { ...DEFAULT_THEME, ...JSON.parse(saved) } : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

let frame = 0;
function applyTheme(theme: ThemeVars) {
  window.cancelAnimationFrame(frame);
  frame = window.requestAnimationFrame(() => {
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem('moss-theme', JSON.stringify(theme));
  });
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: loadTheme(),
  setVar: (key, value) => {
    const theme = { ...get().theme, [key]: value };
    applyTheme(theme);
    set({ theme });
  },
  importTheme: (incoming) => {
    const theme = { ...DEFAULT_THEME, ...incoming };
    applyTheme(theme);
    set({ theme });
  },
  reset: () => {
    applyTheme(DEFAULT_THEME);
    set({ theme: DEFAULT_THEME });
  },
}));

export function initializeTheme() {
  applyTheme(useThemeStore.getState().theme);
}
