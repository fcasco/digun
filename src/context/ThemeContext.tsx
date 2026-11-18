import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppTheme = 'slate' | 'clay' | 'saas' | 'nordic' | 'glassmorphism' | 'obsidian' | 'neobrutalism' | 'terminal';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isSlate: boolean;
  isClay: boolean;
  isSaas: boolean;
  isNordic: boolean;
  isGlass: boolean;
  isBrutal: boolean;
  isObsidian: boolean;
}

const THEME_STORAGE_KEY = 'articulation_ui_theme_v7';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'slate';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (
        saved === 'slate' ||
        saved === 'clay' ||
        saved === 'saas' ||
        saved === 'nordic' ||
        saved === 'glassmorphism' ||
        saved === 'neobrutalism' ||
        saved === 'terminal' ||
        saved === 'obsidian'
      ) {
        return saved;
      }
      return 'slate';
    } catch {
      return 'slate';
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
    const order: AppTheme[] = ['slate', 'clay', 'saas', 'nordic', 'glassmorphism', 'obsidian', 'neobrutalism', 'terminal'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  }, [theme, setTheme]);

  // Sync root <html> & <body> attributes/classes for seamless background & scrollbar styling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'slate') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'slate');
      document.body.className = 'bg-[#0F172A] text-slate-100 antialiased selection:bg-teal-400/25 selection:text-teal-100';
    } else if (theme === 'clay') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'clay');
      document.body.className = 'bg-[#EEF2FA] text-[#1E2547] antialiased selection:bg-indigo-500/20 selection:text-indigo-950';
    } else if (theme === 'saas') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'saas');
      document.body.className = 'bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-indigo-600/15 selection:text-indigo-950';
    } else if (theme === 'nordic') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'nordic');
      document.body.className = 'bg-[#F6F3EC] text-[#242E28] antialiased selection:bg-[#527360]/20 selection:text-[#242E28]';
    } else if (theme === 'neobrutalism') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'neobrutalism');
      document.body.className = 'bg-[#FFFDF5] text-zinc-950 antialiased selection:bg-[#FFE500] selection:text-black';
    } else if (theme === 'obsidian') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'obsidian');
      document.body.className = 'bg-[#070709] text-[#F5F0E6] antialiased selection:bg-[#D4AF37]/30 selection:text-[#F3E5AB]';
    } else if (theme === 'glassmorphism') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'glassmorphism');
      document.body.className = 'bg-[#07111F] text-slate-100 antialiased selection:bg-sky-400/30 selection:text-sky-100';
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
        isSlate: theme === 'slate',
        isClay: theme === 'clay',
        isSaas: theme === 'saas',
        isNordic: theme === 'nordic',
        isGlass: theme === 'glassmorphism',
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
