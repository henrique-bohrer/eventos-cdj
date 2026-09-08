'use client';

import React, { useState } from 'react';
import { INITIAL_EVENTS } from '@/data/events';
import { TechEvent } from '@/types/event';
import { Header } from '@/components/Header';
import { SuggestedEventCard } from '@/components/SuggestedEventCard';
import { ApprovedEventCard } from '@/components/ApprovedEventCard';
import { InitialLoadingScreen } from '@/components/InitialLoadingScreen';
import {
  FolderCheck,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  Loader2,
  Lock,
  Ticket,
} from 'lucide-react';

export default function Home() {
  const [suggestedEvents, setSuggestedEvents] = useState<TechEvent[]>(INITIAL_EVENTS);
  const [approvedEvents, setApprovedEvents] = useState<TechEvent[]>([]);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');

  // Status state for Discord Webhook sending
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleApproveEvent = (event: TechEvent) => {
    setLimitWarning(null);
    setStatusMessage(null);

    if (approvedEvents.length >= 4) {
      setLimitWarning(
        `Limite máximo atingido! A pasta de "Eventos Aprovados" já possui 4 eventos de TI. Remova um evento para adicionar "${event.title}".`
      );
      return;
    }

    // Add to approved, remove from suggested
    setApprovedEvents((prev) => [...prev, event]);
    setSuggestedEvents((prev) => prev.filter((item) => item.id !== event.id));
  };

  const handleRejectEvent = (event: TechEvent) => {
    setLimitWarning(null);
    setStatusMessage(null);
    setSuggestedEvents((prev) => prev.filter((item) => item.id !== event.id));
  };

  const handleRemoveApproved = (event: TechEvent) => {
    setLimitWarning(null);
    setStatusMessage(null);
    setApprovedEvents((prev) => prev.filter((item) => item.id !== event.id));
    // Return back to suggested list
    setSuggestedEvents((prev) => [...prev, event]);
  };

  const handleResetList = () => {
    setSuggestedEvents(INITIAL_EVENTS);
    setApprovedEvents([]);
    setLimitWarning(null);
    setStatusMessage(null);
  };

  const handleSendToDiscord = async () => {
    if (approvedEvents.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'Sua pasta de Eventos Aprovados está vazia. Adicione ao menos um evento antes de enviar.',
      });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: approvedEvents }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao enviar resumos para o Discord.');
      }

      setStatusMessage({
        type: 'success',
        text: `🎉 Sucesso! ${approvedEvents.length} evento(s) enviado(s) para o canal do Discord!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao tentar enviar para o Discord.';
      setStatusMessage({
        type: 'error',
        text: msg,
      });
    } finally {
      setIsSending(false);
    }
  };

  const filteredSuggestedEvents = suggestedEvents.filter((ev) => {
    if (filterType === 'free') return !ev.isPaid;
    if (filterType === 'paid') return ev.isPaid;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* 3-Second Initial Loading Splash Screen */}
      <InitialLoadingScreen durationMs={3000} />

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Alert for 4 items limit */}
        {limitWarning && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-400 dark:border-amber-700 p-4 shadow-md flex items-start gap-3 animate-in fade-in duration-200">
            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm sm:text-base flex items-center gap-2">
                Aviso de Limite da Pasta (Máximo 4 Eventos)
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 mt-1">
                {limitWarning}
              </p>
            </div>
            <button
              onClick={() => setLimitWarning(null)}
              className="text-amber-700 dark:text-amber-400 hover:text-amber-900 font-bold text-sm px-2 py-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Discord Status Message Banner */}
        {statusMessage && (
          <div
            className={`rounded-xl border p-4 shadow-md flex items-start justify-between gap-3 ${statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200'
              }`}
          >
            <div className="flex items-start gap-3">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm sm:text-base">
                  {statusMessage.type === 'success' ? 'Envio Concluído' : 'Erro no Envio'}
                </h4>
                <p className="text-xs sm:text-sm mt-0.5">{statusMessage.text}</p>
                {statusMessage.type === 'error' && (
                  <button
                    onClick={handleSendToDiscord}
                    className="mt-2 text-xs font-semibold underline hover:no-underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Tentar novamente
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-current opacity-70 hover:opacity-100 font-bold text-sm px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Suggested Events Section (2 Columns grid on medium+) */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#ebdcc9] dark:border-[#3b3226] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#f59308] dark:text-[#fdb22b]" />
                <h2 className="text-xl font-bold text-[#211c15] dark:text-[#f7f3ec]">
                  Sugestões de Eventos de TI
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ebdcc9]/50 dark:bg-[#3b3226] text-[#61584c] dark:text-[#b8ac9c]">
                  {suggestedEvents.length} disponíveis
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Filter controls by price */}
                <div className="inline-flex rounded-lg p-1 bg-[#f1e6d4]/50 dark:bg-[#201a13] border border-[#ebdcc9] dark:border-[#3b3226] text-xs">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-white dark:bg-[#32291d] text-[#17130d] dark:text-[#f7f3ec] shadow-xs'
                        : 'text-[#70624f] dark:text-[#a89a88] hover:text-[#17130d] dark:hover:text-[#f7f3ec]'
                    }`}
                  >
                    Todos ({suggestedEvents.length})
                  </button>
                  <button
                    onClick={() => setFilterType('free')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      filterType === 'free'
                        ? 'bg-white dark:bg-[#32291d] text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-[#70624f] dark:text-[#a89a88] hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                  >
                    Gratuitos ({suggestedEvents.filter((e) => !e.isPaid).length})
                  </button>
                  <button
                    onClick={() => setFilterType('paid')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      filterType === 'paid'
                        ? 'bg-white dark:bg-[#32291d] text-amber-700 dark:text-amber-400 shadow-xs'
                        : 'text-[#70624f] dark:text-[#a89a88] hover:text-amber-600 dark:hover:text-amber-400'
                    }`}
                  >
                    Pagos ({suggestedEvents.filter((e) => e.isPaid).length})
                  </button>
                </div>

                <button
                  onClick={handleResetList}
                  className="text-xs font-medium text-[#61584c] dark:text-[#b8ac9c] hover:text-[#f59308] dark:hover:text-[#fdb22b] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restaurar
                </button>
              </div>
            </div>

            {filteredSuggestedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuggestedEvents.map((event) => (
                  <SuggestedEventCard
                    key={event.id}
                    event={event}
                    onApprove={handleApproveEvent}
                    onReject={handleRejectEvent}
                  />
                ))}
              </div>
            ) : suggestedEvents.length > 0 ? (
              <div className="rounded-xl border border-dashed border-[#ebdcc9] dark:border-[#3b3226] p-8 text-center bg-white/50 dark:bg-[#241e16]/50">
                <Ticket className="w-8 h-8 mx-auto text-[#61584c] dark:text-[#b8ac9c] mb-2 opacity-60" />
                <p className="text-sm text-[#61584c] dark:text-[#b8ac9c]">
                  Nenhum evento encontrado para o filtro selecionado (&quot;{filterType === 'free' ? 'Gratuitos' : 'Pagos'}&quot;).
                </p>
                <button
                  onClick={() => setFilterType('all')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-[#f59308] dark:bg-[#fdb22b] text-[#17130d] font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                >
                  Ver todos os eventos
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#ebdcc9] dark:border-[#3b3226] p-8 text-center bg-white/50 dark:bg-[#241e16]/50">
                <Info className="w-8 h-8 mx-auto text-[#61584c] dark:text-[#b8ac9c] mb-2" />
                <p className="text-sm text-[#61584c] dark:text-[#b8ac9c]">
                  Todas as sugestões foram avaliadas!
                </p>
                <button
                  onClick={handleResetList}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-[#f59308] dark:bg-[#fdb22b] text-[#17130d] font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Recarregar Eventos de Curitiba
                </button>
              </div>
            )}
          </section>

          {/* RIGHT: Approved Events Folder */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcc9] dark:border-[#3b3226] pb-3">
              <div className="flex items-center gap-2">
                <FolderCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-bold text-[#211c15] dark:text-[#f7f3ec]">
                  Eventos Aprovados
                </h2>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${approvedEvents.length >= 4
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  }`}
              >
                {approvedEvents.length} / 4
              </span>
            </div>

            {/* List of Approved Events */}
            {approvedEvents.length > 0 ? (
              <div className="space-y-3">
                {approvedEvents.map((event) => (
                  <ApprovedEventCard
                    key={event.id}
                    event={event}
                    onRemove={handleRemoveApproved}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#ebdcc9] dark:border-[#3b3226] p-6 text-center bg-white/30 dark:bg-[#241e16]/30">
                <FolderCheck className="w-8 h-8 mx-auto text-[#61584c] dark:text-[#b8ac9c] mb-2 opacity-50" />
                <p className="text-xs sm:text-sm text-[#61584c] dark:text-[#b8ac9c]">
                  Nenhum evento aprovado ainda. Clique em &quot;SIM&quot; nos cards de sugestão para adicionar eventos aqui.
                </p>
              </div>
            )}

            {/* Primary Action Button: Send Summaries to Discord */}
            <div className="pt-2">
              <button
                onClick={handleSendToDiscord}
                disabled={isSending || approvedEvents.length === 0}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#f59308] to-[#fdb22b] hover:from-[#d97d02] hover:to-[#e59e19] text-[#17130d] shadow-lg shadow-[#f59308]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando para o Discord...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Resumos para o Discord
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#ebdcc9] dark:border-[#3b3226] py-6 text-center text-xs text-[#61584c] dark:text-[#b8ac9c]">
        Tech Events Curitiba • Desenvolvido com Next.js (App Router) & Tailwind CSS
      </footer>
    </div>
  );
}
