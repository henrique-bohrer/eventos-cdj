'use client';

import React from 'react';
import { Trash2, ExternalLink } from 'lucide-react';

export interface ApprovedEvent {
  id: string;
  name: string;
  summary: string;
  isPaid: boolean;
  dateTime?: string;
  organizer?: string;
  location?: string;
  link?: string;
}

const MAX_APPROVED = 4;

interface ApprovedEventsFolderProps {
  events: ApprovedEvent[];
  onRemove?: (event: ApprovedEvent) => void;
}

export function ApprovedEventsFolder({ events, onRemove }: ApprovedEventsFolderProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#f7f3ec]">
          Eventos em destaque ({events.length}/{MAX_APPROVED})
        </h2>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            events.length === MAX_APPROVED
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-800/60'
              : 'bg-slate-100 text-slate-700 dark:bg-[#1a150e] dark:text-[#b8ac9c] dark:border dark:border-[#3b3226]'
          }`}
        >
          {events.length === MAX_APPROVED ? 'Capacidade Máxima' : `${MAX_APPROVED - events.length} vaga(s) livre(s)`}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#3b3226] bg-white/40 dark:bg-[#1a150e]/30 p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-[#b8ac9c]">
            Nenhum evento aprovado ainda. Clique em &ldquo;✓ Sim&rdquo; nos eventos da fila para adicioná-los aos destaques.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300 dark:hover:border-[#fdb22b]/50"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-[#f7f3ec] text-base leading-snug">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-[#f59308] dark:hover:text-[#fdb22b] transition-colors"
                        title="Abrir link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {onRemove && (
                      <button
                        onClick={() => onRemove(event)}
                        aria-label={`Remover ${event.name}`}
                        title="Remover dos destaques"
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {event.dateTime && (
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-[#b8ac9c]">
                    {event.dateTime}
                  </p>
                )}

                <p className="mt-2 text-sm text-slate-600 dark:text-[#b8ac9c] leading-relaxed">
                  {event.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#3b3226] flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    event.isPaid
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-800/60'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-800/60'
                  }`}
                >
                  {event.isPaid ? 'Pago' : 'Gratuito'}
                </span>

                {event.organizer && (
                  <span className="text-xs text-slate-400 dark:text-[#b8ac9c]/70 truncate max-w-[150px]">
                    {event.organizer}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
