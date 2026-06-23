import { useEffect } from 'react';
import { initializeTheme } from '../store/themeStore';

export function useTheme() {
  useEffect(() => {
    initializeTheme();
  }, []);
}
