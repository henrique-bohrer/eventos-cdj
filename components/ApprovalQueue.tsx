'use client';

import React, { useState } from 'react';
import { EventCard } from './EventCard';

export interface PendingEvent {
  id: string;
  name: string;
  organizer: string;
  dateTime: string;
  isPaid: boolean;
  summary?: string;
  location?: string;
  link?: string;
  category?: string;
  modality?: string;
}

const MAX_APPROVED = 4;

export interface ApprovalQueueProps {
  initialEvents?: PendingEvent[];
  events?: PendingEvent[];
  approvedCount: number;
  onApprove?: (event: PendingEvent) => void;
  onReject?: (event: PendingEvent) => void;
  onLimitReached?: (message: string) => void;
}

export function ApprovalQueue({
  initialEvents,
  events: controlledEvents,
  approvedCount,
  onApprove,
  onReject,
  onLimitReached,
}: ApprovalQueueProps) {
  // Support both controlled mode (via props.events) and uncontrolled mode (via initialEvents)
  const [internalEvents, setInternalEvents] = useState<PendingEvent[]>(initialEvents || []);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const activeEvents = controlledEvents !== undefined ? controlledEvents : internalEvents;
  const isFull = approvedCount >= MAX_APPROVED;

  const handleDecision = (event: PendingEvent, approved: boolean) => {
    setWarningMessage(null);

    if (approved && isFull) {
      const msg = 'A pasta de destaques já está com 4 eventos. Remova um para aprovar outro.';
      setWarningMessage(msg);
      if (onLimitReached) {
        onLimitReached(msg);
      } else {
        alert(msg);
      }
      return;
    }

    if (controlledEvents === undefined) {
      setInternalEvents((prev) => prev.filter((e) => e.id !== event.id));
    }

    if (approved) {
      onApprove?.(event);
    } else {
      onReject?.(event);
    }
  };

  return (
    <div className="space-y-4">
      {warningMessage && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 p-4 text-sm text-amber-800 dark:text-amber-200 flex items-center justify-between">
          <span>{warningMessage}</span>
          <button
            onClick={() => setWarningMessage(null)}
            className="text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {activeEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#3b3226] bg-white/50 dark:bg-[#1a150e]/40 p-10 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-[#b8ac9c]">
            Nenhum evento pendente na fila de aprovação no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeEvents.map((event) => (
            <EventCard
              key={event.id}
              name={event.name}
              organizer={event.organizer}
              dateTime={event.dateTime}
              isPaid={event.isPaid}
              location={event.location}
              summary={event.summary}
              link={event.link}
              category={event.category}
              modality={event.modality}
              onApprove={() => handleDecision(event, true)}
              onReject={() => handleDecision(event, false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
