'use client';

import React from 'react';
import { TechEvent, EventCategory } from '@/types/event';
import {
  Check,
  X,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  UserCheck,
  AlertCircle,
  Trophy,
  Mic,
  Users,
  Globe,
  Code2,
} from 'lucide-react';

interface SuggestedEventCardProps {
  event: TechEvent;
  onApprove: (event: TechEvent) => void;
  onReject: (event: TechEvent) => void;
}

const CATEGORY_CONFIG: Record<
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

export function SuggestedEventCard({ event, onApprove, onReject }: SuggestedEventCardProps) {
  const categoryMeta = event.category ? CATEGORY_CONFIG[event.category] : null;
  const CategoryIcon = categoryMeta?.icon;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#ebdcc9] dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-5 shadow-sm hover:shadow-md hover:border-[#f59308]/50 dark:hover:border-[#fdb22b]/50 transition-all duration-200">
      <div className="space-y-3">
        {/* Category & Modality Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoryMeta && CategoryIcon && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${categoryMeta.colorClass}`}
            >
              <CategoryIcon className="w-3.5 h-3.5" />
              <span>{categoryMeta.label}</span>
            </span>
          )}

          {event.modality && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#ebdcc9]/40 dark:bg-[#3b3226]/60 text-[#574c3d] dark:text-[#b8ac9c] border border-[#ebdcc9] dark:border-[#3b3226]">
              {event.modality}
            </span>
          )}
        </div>

        {/* Title and Organizer */}
        <div>
          <h3 className="text-lg font-bold text-[#17130d] dark:text-[#f7f3ec] leading-snug">
            {event.title}
          </h3>
          <p className="text-sm text-[#574c3d] dark:text-[#b8ac9c] mt-1 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#f59308] dark:text-[#fdb22b] shrink-0" />
            <span>
              <strong className="font-semibold text-[#17130d] dark:text-[#f7f3ec]">Organizador:</strong> {event.organizer}
            </span>
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
                <AlertCircle className="w-3 h-3" /> A Confirmar
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#f59308] dark:text-[#fdb22b] shrink-0" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#574c3d] dark:text-[#b8ac9c]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Summary preview */}
        <p className="text-xs text-[#574c3d] dark:text-[#b8ac9c] line-clamp-2 italic">
          &ldquo;{event.summary}&rdquo;
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
              className="p-2 rounded-lg text-[#574c3d] dark:text-[#b8ac9c] hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
              title="Abrir link do evento"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* SIM button */}
          <button
            onClick={() => onApprove(event)}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-800 transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>SIM</span>
          </button>

          {/* NÃO button */}
          <button
            onClick={() => onReject(event)}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-800 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/80 border border-rose-300 dark:border-rose-800 transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>NÃO</span>
          </button>
        </div>
      </div>
    </div>
  );
}



