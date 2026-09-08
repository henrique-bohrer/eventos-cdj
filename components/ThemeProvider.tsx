'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

const themeListeners = new Set<() => void>();

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    themeListeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getThemeSnapshot(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('cwb_events_theme') as Theme) || 'dark';
}

function getServerSnapshot(): Theme {
  return 'dark';
}

function getMountedSnapshot(): boolean {
  return true;
}

function getServerMountedSnapshot(): boolean {
  return false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(subscribeTheme, getMountedSnapshot, getServerMountedSnapshot);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('cwb_events_theme', nextTheme);
    } catch {
      // ignore
    }
    themeListeners.forEach((listener) => listener());
  };

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'dark', toggleTheme }}>
      <div className={mounted ? '' : 'dark'}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}

