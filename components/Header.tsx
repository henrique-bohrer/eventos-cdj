'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Calendar, MapPin } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-[#ebdcc9] dark:border-[#3b3226] bg-white/70 dark:bg-[#17130d]/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fdb22b] to-[#f59308] flex items-center justify-center shadow-lg shadow-[#f59308]/20">
            <Calendar className="w-6 h-6 text-[#17130d]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#211c15] dark:text-[#f7f3ec] flex items-center gap-2">
              Tech Events <span className="text-[#f59308] dark:text-[#fdb22b]">Curitiba</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#61584c] dark:text-[#b8ac9c] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#f59308] dark:text-[#fdb22b]" />
              Gerenciamento de Eventos de TI da Região
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#ebdcc9] dark:border-[#3b3226] bg-[#fffcf5] dark:bg-[#241e16] text-[#211c15] dark:text-[#f7f3ec] hover:border-[#f59308] dark:hover:border-[#fdb22b] transition-all duration-200 cursor-pointer text-sm font-medium shadow-sm"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-[#fdb22b]" />
              <span className="hidden sm:inline">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#f59308]" />
              <span className="hidden sm:inline">Modo Escuro</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
