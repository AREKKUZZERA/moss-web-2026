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
  '--shadow-panel': string;
  '--shadow-card-hover': string;
  '--shadow-chart-hover': string;
  '--shadow-modal': string;
  '--shadow-modal-strong': string;
  '--shadow-drawer': string;
  '--shadow-mobile-nav': string;
  '--shadow-range-thumb': string;
  '--modal-backdrop': string;
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
  '--ok': string;
  '--warn': string;
  '--vip': string;
  '--txt': string;
  '--txt2': string;
  '--mut': string;
  '--radius-xs': string;
  '--radius-sm': string;
  '--radius-md': string;
  '--radius': string;
  '--radius-l': string;
  '--radius-pill': string;
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
  '--shadow-panel': '0 18px 60px rgba(0,0,0,0.18)',
  '--shadow-card-hover': '0 18px 42px rgba(242,57,135,0.14)',
  '--shadow-chart-hover': '0 0 0 1px rgba(125,211,252,0.08), 0 10px 30px rgba(125,211,252,0.08)',
  '--shadow-modal': '0 30px 90px rgba(0,0,0,0.42)',
  '--shadow-modal-strong': '0 30px 90px rgba(0,0,0,0.46)',
  '--shadow-drawer': '-24px 0 80px rgba(0,0,0,0.36)',
  '--shadow-mobile-nav': '0 18px 50px rgba(0,0,0,0.36)',
  '--shadow-range-thumb': '0 0 0 1px rgba(125,211,252,0.76), 0 2px 7px rgba(0,0,0,0.36)',
  '--modal-backdrop': 'rgba(0,0,0,0.58)',
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
  '--ok': '#65d6a6',
  '--warn': '#ffd166',
  '--vip': '#ffd166',
  '--txt': '#f1eee9',
  '--txt2': '#b8b0aa',
  '--mut': '#7b716b',
  '--radius-xs': '3px',
  '--radius-sm': '6px',
  '--radius-md': '7px',
  '--radius': '8px',
  '--radius-l': '14px',
  '--radius-pill': '999px',
  '--radius-round': '50%',
};

type ThemeStore = {
  theme: ThemeVars;
  setVar: (key: keyof ThemeVars, value: string) => void;
  importTheme: (theme: unknown) => void;
  reset: () => void;
};

function normalizeTheme(incoming: unknown): ThemeVars {
  if (!incoming || typeof incoming !== 'object') return DEFAULT_THEME;
  return (Object.keys(DEFAULT_THEME) as Array<keyof ThemeVars>).reduce<ThemeVars>((theme, key) => {
    const value = (incoming as Partial<Record<keyof ThemeVars, unknown>>)[key];
    theme[key] = typeof value === 'string' ? value : DEFAULT_THEME[key];
    return theme;
  }, { ...DEFAULT_THEME });
}

function loadTheme(): ThemeVars {
  try {
    const saved = localStorage.getItem('moss-theme');
    return saved ? normalizeTheme(JSON.parse(saved)) : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

let frame = 0;
let persistTimer = 0;
const pendingVars = new Map<keyof ThemeVars, string>();

function persistTheme(theme: ThemeVars) {
  window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    localStorage.setItem('moss-theme', JSON.stringify(theme));
  }, 180);
}

function flushVars() {
  pendingVars.forEach((value, key) => {
    document.documentElement.style.setProperty(key, value);
  });
  pendingVars.clear();
  frame = 0;
}

function scheduleVar(key: keyof ThemeVars, value: string) {
  pendingVars.set(key, value);
  if (!frame) {
    frame = window.requestAnimationFrame(flushVars);
  }
}

function applyTheme(theme: ThemeVars) {
  Object.entries(theme).forEach(([key, value]) => {
    pendingVars.set(key as keyof ThemeVars, value);
  });
  if (!frame) {
    frame = window.requestAnimationFrame(flushVars);
  }
  persistTheme(theme);
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: loadTheme(),
  setVar: (key, value) => {
    if (get().theme[key] === value) return;
    const theme = { ...get().theme, [key]: value };
    scheduleVar(key, value);
    persistTheme(theme);
    set({ theme });
  },
  importTheme: (incoming) => {
    const theme = normalizeTheme(incoming);
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
