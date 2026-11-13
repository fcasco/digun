import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppTheme = 'obsidian' | 'neobrutalism' | 'terminal';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isBrutal: boolean;
  isObsidian: boolean;
}

const THEME_STORAGE_KEY = 'articulation_ui_theme_v2';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'obsidian';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'neobrutalism' || saved === 'terminal' || saved === 'obsidian') {
        return saved;
      }
      return 'obsidian';
    } catch {
      return 'obsidian';
    }
  });

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignored in restricted environments
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const order: AppTheme[] = ['obsidian', 'neobrutalism', 'terminal'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  }, [theme, setTheme]);

  // Sync root <html> & <body> attributes/classes for seamless background & scrollbar styling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'neobrutalism') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'neobrutalism');
      document.body.className = 'bg-[#FFFDF5] text-zinc-950 antialiased selection:bg-[#FFE500] selection:text-black';
    } else if (theme === 'obsidian') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'obsidian');
      document.body.className = 'bg-[#070709] text-[#F5F0E6] antialiased selection:bg-[#D4AF37]/30 selection:text-[#F3E5AB]';
    } else {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'terminal');
      document.body.className = 'bg-[#09090b] text-[#e4e4e7] antialiased selection:bg-zinc-800 selection:text-zinc-100';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isBrutal: theme === 'neobrutalism',
        isObsidian: theme === 'obsidian',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
