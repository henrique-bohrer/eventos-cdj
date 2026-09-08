'use client';

import React from 'react';
import { TechEvent } from '@/types/event';
import { Trash2, ExternalLink, Calendar, Clock, MapPin, Ticket } from 'lucide-react';

interface ApprovedEventCardProps {
  event: TechEvent;
  onRemove: (event: TechEvent) => void;
}

export function ApprovedEventCard({ event, onRemove }: ApprovedEventCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#ebdcc9] dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-4 shadow-sm relative group transition-all duration-200 hover:border-[#f59308] dark:hover:border-[#fdb22b] hover:shadow-md">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-[#17130d] dark:text-[#f7f3ec] text-base leading-snug">
            {event.title}
          </h4>
          <button
            onClick={() => onRemove(event)}
            aria-label="Remover evento"
            title="Remover da pasta de aprovados"
            className="p-1.5 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all duration-150 active:scale-90 hover:scale-110 cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Date, Time and Location details */}
        <div className="space-y-1 text-xs text-[#574c3d] dark:text-[#b8ac9c] bg-[#fcf8f0] dark:bg-[#1a150e] p-2.5 rounded-lg border border-[#ebdcc9] dark:border-[#3b3226]">
          <div className="flex items-center gap-1.5 font-semibold text-[#17130d] dark:text-[#f7f3ec]">
            <Calendar className="w-3.5 h-3.5 text-[#f59308] dark:text-[#fdb22b] shrink-0" />
            <span>{event.date}</span>
            {event.time && (
              <>
                <span className="text-[#ebdcc9] dark:text-[#3b3226]">•</span>
                <Clock className="w-3 h-3 text-[#f59308] dark:text-[#fdb22b] shrink-0" />
                <span>{event.time}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] truncate">
            <MapPin className="w-3 h-3 text-[#f59308] dark:text-[#fdb22b] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <p className="text-xs text-[#574c3d] dark:text-[#b8ac9c] line-clamp-2 leading-relaxed">
          {event.summary}
        </p>
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-[#ebdcc9] dark:border-[#3b3226] flex items-center justify-between gap-2 flex-wrap">
        <div>
          {event.isPaid ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Ticket className="w-3 h-3" />
              <span>{event.price || 'Pago'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <Ticket className="w-3 h-3" />
              <span>{event.price || 'Gratuito'}</span>
            </span>
          )}
        </div>

        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#f59308] dark:text-[#fdb22b] hover:underline flex items-center gap-1 font-bold transition-transform active:scale-95"
          >
            Link <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}


