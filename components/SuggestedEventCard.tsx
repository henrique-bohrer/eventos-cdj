'use client';

import React from 'react';
import { TechEvent } from '@/types/event';
import { Check, X, MapPin, Calendar, Clock, ExternalLink, UserCheck, AlertCircle } from 'lucide-react';

interface SuggestedEventCardProps {
  event: TechEvent;
  onApprove: (event: TechEvent) => void;
  onReject: (event: TechEvent) => void;
}

export function SuggestedEventCard({ event, onApprove, onReject }: SuggestedEventCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#ebdcc9] dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        {/* Title and Organizer */}
        <div>
          <h3 className="text-lg font-bold text-[#17130d] dark:text-[#f7f3ec] leading-snug">
            {event.title}
          </h3>
          <p className="text-sm text-[#574c3d] dark:text-[#b8ac9c] mt-1 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#f59308] dark:text-[#fdb22b] shrink-0" />
            <span><strong className="font-semibold text-[#17130d] dark:text-[#f7f3ec]">Organizador:</strong> {event.organizer}</span>
          </p>
        </div>

        {/* Info list */}
        <div className="space-y-1.5 text-xs sm:text-sm text-[#17130d] dark:text-[#f7f3ec] bg-[#fcf8f0] dark:bg-[#1a150e] p-3 rounded-lg border border-[#ebdcc9] dark:border-[#3b3226]">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#f59308] dark:text-[#fdb22b] shrink-0 mt-0.5" />
            <span className="font-medium">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-[#f59308] dark:text-[#fdb22b] shrink-0" />
            <span className="font-bold">{event.date}</span>
            {event.ticketsConfirmed === false && (
              <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800">
                <AlertCircle className="w-3 h-3" /> Data Fictícia / A Confirmar
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#f59308] dark:text-[#fdb22b] shrink-0" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Summary preview */}
        <p className="text-xs text-[#574c3d] dark:text-[#b8ac9c] line-clamp-2 italic">
          "{event.summary}"
        </p>
      </div>

      {/* Bottom Section */}
      <div className="mt-5 pt-3 border-t border-[#ebdcc9] dark:border-[#3b3226] flex items-center justify-between gap-3">
        {/* Bottom Left Badge */}
        <div>
          {event.isPaid ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900">
              PAGO
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              GRATUITO
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[#574c3d] dark:text-[#b8ac9c] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Abrir link do evento"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* SIM button */}
          <button
            onClick={() => onApprove(event)}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>SIM</span>
          </button>

          {/* NÃO button */}
          <button
            onClick={() => onReject(event)}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-800 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/80 border border-rose-300 dark:border-rose-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>NÃO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
