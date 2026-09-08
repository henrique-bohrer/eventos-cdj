'use client';

import React from 'react';
import { TechEvent, EventCategory } from '@/types/event';
import { Trash2, ExternalLink, Calendar, MapPin, Trophy, Mic, Users, Globe, Code2 } from 'lucide-react';

interface ApprovedEventCardProps {
  event: TechEvent;
  onRemove: (event: TechEvent) => void;
}

const CATEGORY_LABEL: Record<
  EventCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; colorClass: string }
> = {
  hackathon: {
    label: 'Hackathon',
    icon: Trophy,
    colorClass:
      'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
  },
  palestra: {
    label: 'Palestra',
    icon: Mic,
    colorClass:
      'bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800',
  },
  conferencia: {
    label: 'Conferência',
    icon: Globe,
    colorClass:
      'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
  },
  meetup: {
    label: 'Meetup',
    icon: Users,
    colorClass:
      'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
  },
  workshop: {
    label: 'Workshop',
    icon: Code2,
    colorClass:
      'bg-indigo-100 text-indigo-900 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
  },
};

export function ApprovedEventCard({ event, onRemove }: ApprovedEventCardProps) {
  const categoryMeta = event.category ? CATEGORY_LABEL[event.category] : null;
  const CategoryIcon = categoryMeta?.icon;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#ebdcc9] dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-4 shadow-sm relative group transition-all duration-200 hover:border-[#f59308] dark:hover:border-[#fdb22b] hover:shadow-md">
      <div className="space-y-2">
        {/* Category & Modality tag */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoryMeta && CategoryIcon && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${categoryMeta.colorClass}`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{categoryMeta.label}</span>
            </span>
          )}
          {event.modality && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ebdcc9]/40 dark:bg-[#3b3226]/60 text-[#574c3d] dark:text-[#b8ac9c]">
              {event.modality}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-[#17130d] dark:text-[#f7f3ec] text-sm leading-snug">
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

        <div className="space-y-1 text-xs text-[#574c3d] dark:text-[#b8ac9c]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#f59308] dark:text-[#fdb22b] shrink-0" />
            <span className="font-medium text-[#17130d] dark:text-[#f7f3ec]">{event.date}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#f59308] dark:text-[#fdb22b] shrink-0 mt-0.5" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <p className="text-xs text-[#574c3d] dark:text-[#b8ac9c] line-clamp-2 leading-relaxed italic">
          &ldquo;{event.summary}&rdquo;
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#ebdcc9] dark:border-[#3b3226] flex items-center justify-between">
        <div>
          {event.isPaid ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900">
              PAGO
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              GRATUITO
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
            Acessar Link <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}



