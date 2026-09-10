'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Calendar, MapPin } from 'lucide-react';

/**
 * LOGO_IMAGE_URL
 * Place your SVG or PNG image URL here to replace the default icon.
 * Example: 'https://exemplo.com.br/logo.svg' or '/logo.svg'
 */
const LOGO_IMAGE_URL: string | null = null;

interface HeaderProps {
  customLogoUrl?: string;
}

export function Header({ customLogoUrl }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const logoUrl = customLogoUrl || LOGO_IMAGE_URL;

  return (
    <header className="border-b border-slate-200 dark:border-[#3b3226] bg-white/80 dark:bg-[#17130d]/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            /* Custom SVG or PNG Logo */
            <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-1.5 flex items-center justify-center shadow-xs overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Logo Tech Events Curitiba"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            /* Modern Calendar Icon Badge */
            <div className="w-10 h-10 rounded-xl bg-[#f59308] dark:bg-[#fdb22b] flex items-center justify-center shadow-sm shadow-[#f59308]/20 text-[#17130d] font-bold">
              <Calendar className="w-5 h-5 text-white dark:text-[#17130d]" />
            </div>
          )}

          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-[#f7f3ec] flex items-center gap-1.5">
              Tech Events <span className="text-[#f59308] dark:text-[#fdb22b]">Curitiba</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#b8ac9c] flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#f59308] dark:text-[#fdb22b]" />
              Curadoria e Envio de Eventos de TI
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#3b3226] bg-white dark:bg-[#241e16] text-slate-700 dark:text-[#f7f3ec] hover:bg-slate-50 dark:hover:bg-[#1a150e] transition-colors cursor-pointer text-xs font-semibold shadow-xs"
        >
          {theme === 'dark' ? (
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#fdb22b]" />
              <span className="hidden sm:inline">Modo Claro</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-[#f59308]" />
              <span className="hidden sm:inline">Modo Escuro</span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}


