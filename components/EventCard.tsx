'use client';

import React from 'react';
import { X, Check, MapPin, ExternalLink } from 'lucide-react';

export interface EventCardProps {
  name: string;
  organizer: string;
  dateTime: string;
  isPaid: boolean;
  onApprove: () => void;
  onReject: () => void;
  // Optional enhancements for rich tech event details
  location?: string;
  summary?: string;
  link?: string;
  category?: string;
  modality?: string;
}

export function EventCard({
  name,
  organizer,
  dateTime,
  isPaid,
  onApprove,
  onReject,
  location,
  summary,
  link,
  category,
  modality,
}: EventCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-[#fdb22b]/50">
      <div>
        {/* Optional category & modality badge */}
        {(category || modality) && (
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            {category && (
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1a150e] text-slate-600 dark:text-[#b8ac9c] border border-transparent dark:border-[#3b3226]">
                {category}
              </span>
            )}
            {modality && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#1a150e]/60 text-slate-500 dark:text-[#b8ac9c]/80">
                {modality}
              </span>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f7f3ec] leading-snug">
            {name}
          </h3>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-400 hover:text-[#f59308] dark:hover:text-[#fdb22b] transition-colors shrink-0"
              title="Acessar link do evento"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <p className="mt-1 text-sm text-slate-500 dark:text-[#b8ac9c]">{organizer}</p>
        <p className="mt-2 text-sm text-slate-700 dark:text-[#f7f3ec] font-medium flex items-center gap-1.5">
          <span>{dateTime}</span>
        </p>

        {location && (
          <p className="mt-1 text-xs text-slate-500 dark:text-[#b8ac9c] flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-[#fdb22b]/70 shrink-0" />
            <span>{location}</span>
          </p>
        )}

        {summary && (
          <p className="mt-3 text-xs text-slate-600 dark:text-[#b8ac9c] line-clamp-2 leading-relaxed">
            {summary}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#3b3226]">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isPaid
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-800/60'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-800/60'
          }`}
        >
          {isPaid ? 'Pago' : 'Gratuito'}
        </span>

        <div className="flex gap-2">
          <button
            onClick={onReject}
            aria-label={`Rejeitar evento ${name}`}
            className="flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Não</span>
          </button>
          <button
            onClick={onApprove}
            aria-label={`Aprovar evento ${name}`}
            className="flex items-center gap-1 rounded-lg bg-green-50 dark:bg-emerald-950/40 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-emerald-400 hover:bg-green-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Sim</span>
          </button>
        </div>
      </div>
    </div>
  );
}
