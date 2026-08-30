'use client';

import React from 'react';
import { TechEvent } from '@/types/event';
import { Trash2, ExternalLink } from 'lucide-react';

interface ApprovedEventCardProps {
  event: TechEvent;
  onRemove: (event: TechEvent) => void;
}

export function ApprovedEventCard({ event, onRemove }: ApprovedEventCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#ebdcc9] dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-4 shadow-sm relative group transition-all duration-200 hover:border-[#f59308] dark:hover:border-[#fdb22b]">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-[#211c15] dark:text-[#f7f3ec] text-base leading-snug">
            {event.title}
          </h4>
          <button
            onClick={() => onRemove(event)}
            aria-label="Remover evento"
            title="Remover da pasta de aprovados"
            className="p-1.5 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#61584c] dark:text-[#b8ac9c] line-clamp-3 leading-relaxed">
          {event.summary}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#ebdcc9]/40 dark:border-[#3b3226]/40 flex items-center justify-between">
        <div>
          {event.isPaid ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
              PAGO
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              GRATUITO
            </span>
          )}
        </div>

        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#f59308] dark:text-[#fdb22b] hover:underline flex items-center gap-1 font-medium"
          >
            Link <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
