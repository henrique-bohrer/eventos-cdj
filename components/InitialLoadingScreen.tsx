'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface InitialLoadingScreenProps {
  onComplete?: () => void;
  durationMs?: number;
}

export function InitialLoadingScreen({
  onComplete,
  durationMs = 3000,
}: InitialLoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Carregando eventos de tecnologia de Curitiba...');

  useEffect(() => {
    const startTime = Date.now();
    const intervalTime = 30; // ms

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(currentProgress);

      if (currentProgress < 35) {
        setStatusText('Carregando eventos de Curitiba e região...');
      } else if (currentProgress < 75) {
        setStatusText('Sincronizando datas, locais e valores dos ingressos...');
      } else if (currentProgress < 98) {
        setStatusText('Preparando curadoria para aprovação e Discord...');
      } else {
        setStatusText('Tudo pronto!');
      }

      if (elapsed >= durationMs) {
        clearInterval(timer);
        setIsVisible(false);
        if (onComplete) {
          onComplete();
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [durationMs, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      id="initial-loading-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fbf8f2] dark:bg-[#151009] px-4 transition-opacity duration-500 ease-out"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-sm w-full text-center space-y-6">
        {/* Loading Image Frame */}
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#f59308] via-[#fdb22b] to-[#f59308] rounded-2xl blur-sm opacity-70 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#ebdcc9] dark:border-[#423728] shadow-2xl bg-black">
            <Image
              src="/images/curitiba_tech_loader.jpg"
              alt="Tech Events Curitiba Logo"
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Title and Tagline */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-[#f59308]" />
            <span>Curitiba Tech Community</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17130d] dark:text-[#fbf8f2] tracking-tight">
            Tech Events Curitiba
          </h1>
          <p className="text-xs sm:text-sm text-[#70624f] dark:text-[#a89a88]">
            Curadoria, aprovação e integração com Discord
          </p>
        </div>

        {/* 3-Second Animated Progress Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="h-2 w-full bg-[#ebdcc9] dark:bg-[#342b1f] rounded-full overflow-hidden p-0.5 border border-[#ebdcc9] dark:border-[#423728]">
            <div
              className="h-full bg-gradient-to-r from-[#f59308] to-[#fdb22b] rounded-full transition-all duration-75 ease-out shadow-sm shadow-[#f59308]/50"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#70624f] dark:text-[#a89a88]">
            <span className="truncate pr-2">{statusText}</span>
            <span className="font-mono font-bold text-[#f59308] dark:text-[#fdb22b] shrink-0">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Skip button for convenience */}
        <button
          onClick={() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }}
          className="text-xs text-[#70624f] dark:text-[#a89a88] hover:text-[#f59308] dark:hover:text-[#fdb22b] transition-colors underline underline-offset-4 cursor-pointer pt-2"
        >
          Pular introdução
        </button>
      </div>
    </div>
  );
}
