'use client';

import React, { useState, useMemo } from 'react';
import { INITIAL_EVENTS } from '@/data/events';
import { TechEvent, EventCategory } from '@/types/event';
import { Header } from '@/components/Header';
import { ApprovalQueue, PendingEvent } from '@/components/ApprovalQueue';
import { ApprovedEventsFolder, ApprovedEvent } from '@/components/ApprovedEventsFolder';
import {
  Send,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Search,
  X,
  Trophy,
  Mic,
  Users,
  Globe,
  Code2,
  Sparkles,
  Layers,
} from 'lucide-react';

const MAX_APPROVED = 4;

export default function Home() {
  // Pending events queue
  const [queueEvents, setQueueEvents] = useState<TechEvent[]>(INITIAL_EVENTS);
  // Approved events in highlight folder (max 4)
  const [approvedEvents, setApprovedEvents] = useState<TechEvent[]>([]);
  // Warning banner when trying to approve more than 4
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'todos'>('todos');
  const [priceFilter, setPriceFilter] = useState<'todos' | 'gratis' | 'pago'>('todos');

  // AI discovery states
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryTopic, setDiscoveryTopic] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryFeedback, setDiscoveryFeedback] = useState<string | null>(null);

  // Discord sending states
  const [isSending, setIsSending] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: queueEvents.length,
      hackathon: 0,
      palestra: 0,
      workshop: 0,
      conferencia: 0,
      meetup: 0,
    };
    queueEvents.forEach((ev) => {
      if (ev.category && counts[ev.category] !== undefined) {
        counts[ev.category]++;
      }
    });
    return counts;
  }, [queueEvents]);

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    return queueEvents.filter((ev) => {
      if (selectedCategory !== 'todos' && ev.category !== selectedCategory) {
        return false;
      }
      if (priceFilter === 'gratis' && ev.isPaid) return false;
      if (priceFilter === 'pago' && !ev.isPaid) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (ev.name || ev.title || '').toLowerCase().includes(q);
        const orgMatch = (ev.organizer || '').toLowerCase().includes(q);
        const locMatch = (ev.location || '').toLowerCase().includes(q);
        const sumMatch = (ev.summary || '').toLowerCase().includes(q);
        const tagMatch = ev.tags?.some((t) => t.toLowerCase().includes(q));

        if (!titleMatch && !orgMatch && !locMatch && !sumMatch && !tagMatch) {
          return false;
        }
      }
      return true;
    });
  }, [queueEvents, selectedCategory, priceFilter, searchQuery]);

  // Handle approving an event into the highlights folder (Max 4)
  const handleApprove = (item: PendingEvent) => {
    setLimitWarning(null);
    setDiscordStatus(null);

    if (approvedEvents.length >= MAX_APPROVED) {
      setLimitWarning(
        'A pasta de destaques já está com 4 eventos. Remova um evento para aprovar outro.'
      );
      return;
    }

    const eventObj = queueEvents.find((e) => e.id === item.id) || {
      id: item.id,
      title: item.name,
      name: item.name,
      organizer: item.organizer,
      location: item.location || 'Curitiba/PR',
      date: item.dateTime?.split('•')[0]?.trim() || 'Em breve',
      time: item.dateTime?.split('•')[1]?.trim() || '',
      dateTime: item.dateTime,
      isPaid: item.isPaid,
      summary: item.summary || '',
      link: item.link,
    };

    setApprovedEvents((prev) => [...prev, eventObj]);
    setQueueEvents((prev) => prev.filter((e) => e.id !== item.id));
  };

  // Handle rejecting an event
  const handleReject = (item: PendingEvent) => {
    setLimitWarning(null);
    setDiscordStatus(null);
    setQueueEvents((prev) => prev.filter((e) => e.id !== item.id));
  };

  // Remove from approved highlights and return to queue
  const handleRemoveApproved = (event: ApprovedEvent) => {
    setLimitWarning(null);
    setDiscordStatus(null);
    const removed = approvedEvents.find((e) => e.id === event.id);
    setApprovedEvents((prev) => prev.filter((e) => e.id !== event.id));
    if (removed) {
      setQueueEvents((prev) => [removed, ...prev]);
    }
  };

  // Reset entire list back to original
  const handleReset = () => {
    setQueueEvents(INITIAL_EVENTS);
    setApprovedEvents([]);
    setLimitWarning(null);
    setDiscordStatus(null);
    setSearchQuery('');
    setSelectedCategory('todos');
    setPriceFilter('todos');
  };

  // Send summary to Discord webhook using /api/discord-summary
  const handleSendDiscordSummary = async () => {
    if (approvedEvents.length === 0) {
      setDiscordStatus({
        type: 'error',
        text: 'Adicione ao menos um evento aos destaques antes de enviar o resumo.',
      });
      return;
    }

    setIsSending(true);
    setDiscordStatus(null);

    try {
      const payloadEvents = approvedEvents.map((e) => ({
        name: e.name || e.title,
        isPaid: e.isPaid,
        dateTime: e.dateTime || `${e.date} • ${e.time}`,
        organizer: e.organizer,
        location: e.location,
        link: e.link,
      }));

      const res = await fetch('/api/discord-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: payloadEvents }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar resumo para o Discord.');
      }

      setDiscordStatus({
        type: 'success',
        text: `Resumo com ${approvedEvents.length} evento(s) enviado com sucesso para o canal do Discord!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com o webhook.';
      setDiscordStatus({
        type: 'error',
        text: msg,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Discover new events via AI
  const handleDiscover = async (topic?: string) => {
    const q = topic || discoveryTopic || searchQuery;
    setIsDiscovering(true);
    setDiscoveryFeedback(null);

    try {
      const res = await fetch('/api/events/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          category: selectedCategory !== 'todos' ? selectedCategory : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        const existingIds = new Set([
          ...queueEvents.map((e) => e.id),
          ...approvedEvents.map((e) => e.id),
        ]);

        const newEvents: TechEvent[] = data.events
          .filter((e: TechEvent) => !existingIds.has(e.id))
          .map((e: TechEvent) => ({
            ...e,
            name: e.title || e.name,
            dateTime: `${e.date} • ${e.time}`,
          }));

        if (newEvents.length > 0) {
          setQueueEvents((prev) => [...newEvents, ...prev]);
          setDiscoveryFeedback(`${newEvents.length} novos eventos adicionados à fila de aprovação!`);
        } else {
          setDiscoveryFeedback('Os eventos encontrados já estão em sua fila de aprovação.');
        }
      } else {
        setDiscoveryFeedback('Nenhum evento adicional localizado para este filtro no momento.');
      }
    } catch {
      setDiscoveryFeedback('Não foi possível conectar à pesquisa de eventos no momento.');
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffcf5] dark:bg-[#17130d] text-[#17130d] dark:text-[#f7f3ec] transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Warning Banner: Limit of 4 */}
        {limitWarning && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/60 p-4 text-sm text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-[#fdb22b] shrink-0" />
              <span className="font-medium">{limitWarning}</span>
            </div>
            <button
              onClick={() => setLimitWarning(null)}
              className="text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 hover:opacity-75 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Discord Sending Status Feedback */}
        {discordStatus && (
          <div
            className={`rounded-2xl border p-4 text-sm flex items-center justify-between shadow-xs ${
              discordStatus.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40 text-red-900 dark:text-red-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {discordStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span className="font-medium">{discordStatus.text}</span>
            </div>
            <button
              onClick={() => setDiscordStatus(null)}
              className="font-bold px-2 py-0.5 hover:opacity-75 cursor-pointer text-current"
            >
              ✕
            </button>
          </div>
        )}

        {/* SECTION: APPROVED EVENTS FOLDER (PROMPT 3) */}
        <section className="rounded-2xl border border-[#ebdcc9] dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-6 shadow-sm space-y-6">
          <ApprovedEventsFolder
            events={approvedEvents.map((e) => ({
              id: e.id,
              name: e.name || e.title,
              summary: e.summary,
              isPaid: e.isPaid,
              dateTime: e.dateTime || `${e.date} • ${e.time}`,
              organizer: e.organizer,
              location: e.location,
              link: e.link,
            }))}
            onRemove={handleRemoveApproved}
          />

          {/* Action to dispatch highlights summary to Discord (Prompt 4) */}
          <div className="pt-2 border-t border-[#ebdcc9] dark:border-[#3b3226] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <p className="text-xs text-[#574c3d] dark:text-[#b8ac9c]">
              Envie os eventos selecionados formatados em embed diretamente para o canal integrado no Discord.
            </p>
            <button
              onClick={handleSendDiscordSummary}
              disabled={isSending || approvedEvents.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#f59308] hover:bg-[#d97d02] active:bg-[#c26e02] dark:bg-[#fdb22b] dark:hover:bg-[#e59e19] text-white dark:text-[#17130d] text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando resumo...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Resumo para o Discord</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* SECTION: FILTERS & SEARCH CONTROLS */}
        <section className="rounded-2xl border border-[#ebdcc9] dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#574c3d] dark:text-[#b8ac9c]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por nome, organizador, tecnologias (ex: IA, React, Python)..."
                className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-[#fcf8f0] dark:bg-[#1a150e] border border-[#ebdcc9] dark:border-[#3b3226] text-[#17130d] dark:text-[#f7f3ec] placeholder:text-[#574c3d]/60 dark:placeholder:text-[#b8ac9c]/60 focus:outline-none focus:border-[#f59308] dark:focus:border-[#fdb22b] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpar pesquisa"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#574c3d] dark:text-[#b8ac9c] hover:text-[#17130d] dark:hover:text-[#f7f3ec] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Discovery Toggle Button */}
              <button
                onClick={() => setShowDiscovery(!showDiscovery)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  showDiscovery
                    ? 'bg-[#fcf8f0] dark:bg-[#1a150e] text-[#f59308] dark:text-[#fdb22b] border-[#f59308] dark:border-[#fdb22b]'
                    : 'bg-white dark:bg-[#1a150e] text-[#574c3d] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-[#f59308]/60 dark:hover:border-[#fdb22b]/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#f59308] dark:text-[#fdb22b]" />
                <span>Explorar Mais Eventos</span>
              </button>

              {/* Price Filter Pills */}
              <div className="flex items-center rounded-xl bg-[#fcf8f0] dark:bg-[#1a150e] border border-[#ebdcc9] dark:border-[#3b3226] p-1 text-xs font-medium">
                <button
                  onClick={() => setPriceFilter('todos')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    priceFilter === 'todos'
                      ? 'bg-white dark:bg-[#241e16] text-[#17130d] dark:text-[#f7f3ec] shadow-xs'
                      : 'text-[#574c3d] dark:text-[#b8ac9c]'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setPriceFilter('gratis')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    priceFilter === 'gratis'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-[#574c3d] dark:text-[#b8ac9c]'
                  }`}
                >
                  Gratuitos
                </button>
                <button
                  onClick={() => setPriceFilter('pago')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    priceFilter === 'pago'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-[#574c3d] dark:text-[#b8ac9c]'
                  }`}
                >
                  Pagos
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedCategory === 'todos'
                  ? 'bg-[#17130d] text-white dark:bg-[#fdb22b] dark:text-[#17130d] border-[#17130d] dark:border-[#fdb22b] font-semibold'
                  : 'bg-white dark:bg-[#1a150e] text-[#574c3d] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-[#f59308]/50'
              }`}
            >
              <span>Todos</span>
              <span className="opacity-70 text-[11px]">({categoryCounts.todos})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('hackathon')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedCategory === 'hackathon'
                  ? 'bg-[#f59308] dark:bg-[#fdb22b] text-white dark:text-[#17130d] border-[#f59308] dark:border-[#fdb22b] font-semibold'
                  : 'bg-white dark:bg-[#1a150e] text-[#574c3d] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-[#f59308]/50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#f59308] dark:text-[#fdb22b]" />
              <span>Hackathons</span>
              <span className="opacity-70 text-[11px]">({categoryCounts.hackathon})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('palestra')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedCategory === 'palestra'
                  ? 'bg-[#f59308] dark:bg-[#fdb22b] text-white dark:text-[#17130d] border-[#f59308] dark:border-[#fdb22b] font-semibold'
                  : 'bg-white dark:bg-[#1a150e] text-[#574c3d] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-[#f59308]/50'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-sky-500" />
              <span>Palestras</span>
              <span className="opacity-70 text-[11px]">({categoryCounts.palestra})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('workshop')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedCategory === 'workshop'
                  ? 'bg-[#f59308] dark:bg-[#fdb22b] text-white dark:text-[#17130d] border-[#f59308] dark:border-[#fdb22b] font-semibold'
                  : 'bg-white dark:bg-[#1a150e] text-[#574c3d] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-[#f59308]/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Workshops</span>
              <span className="opacity-70 text-[11px]">({categoryCounts.workshop})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('conferencia')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedCategory === 'conferencia'
                  ? 'bg-[#f59308] dark:bg-[#fdb22b] text-white dark:text-[#17130d] border-[#f59308] dark:border-[#fdb22b] font-semibold'
                  : 'bg-white dark:bg-[#1a150e] text-[#574c3d] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-[#f59308]/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>Conferências</span>
              <span className="opacity-70 text-[11px]">({categoryCounts.conferencia})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('meetup')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedCategory === 'meetup'
                  ? 'bg-[#f59308] dark:bg-[#fdb22b] text-white dark:text-[#17130d] border-[#f59308] dark:border-[#fdb22b] font-semibold'
                  : 'bg-white dark:bg-[#1a150e] text-[#574c3d] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-[#f59308]/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-500" />
              <span>Meetups</span>
              <span className="opacity-70 text-[11px]">({categoryCounts.meetup})</span>
            </button>
          </div>

          {/* Collapsible AI Discovery Tool */}
          {showDiscovery && (
            <div className="pt-3 border-t border-[#ebdcc9] dark:border-[#3b3226] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#17130d] dark:text-[#f7f3ec] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#f59308] dark:text-[#fdb22b]" />
                  Descobrir mais opções de eventos em Curitiba e Região
                </span>
                <button
                  onClick={() => setShowDiscovery(false)}
                  className="text-xs text-[#574c3d] dark:text-[#b8ac9c] hover:text-[#17130d] dark:hover:text-[#f7f3ec]"
                >
                  Fechar
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={discoveryTopic}
                  onChange={(e) => setDiscoveryTopic(e.target.value)}
                  placeholder="Ex: Hackathon de Cidades Inteligentes, DevOps Days, Palestra RAG..."
                  className="flex-1 px-3.5 py-1.5 rounded-lg text-xs bg-[#fcf8f0] dark:bg-[#1a150e] border border-[#ebdcc9] dark:border-[#3b3226] text-[#17130d] dark:text-[#f7f3ec] focus:outline-none focus:border-[#f59308] dark:focus:border-[#fdb22b]"
                />
                <button
                  onClick={() => handleDiscover()}
                  disabled={isDiscovering}
                  className="px-4 py-1.5 rounded-lg bg-[#f59308] hover:bg-[#d97d02] dark:bg-[#fdb22b] dark:hover:bg-[#e59e19] text-white dark:text-[#17130d] text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isDiscovering ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <span>Pesquisar</span>
                  )}
                </button>
              </div>

              {discoveryFeedback && (
                <p className="text-xs text-[#f59308] dark:text-[#fdb22b] font-medium">
                  {discoveryFeedback}
                </p>
              )}
            </div>
          )}
        </section>

        {/* SECTION: APPROVAL QUEUE (PROMPT 1 & PROMPT 2) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#ebdcc9] dark:border-[#3b3226] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#f59308] dark:text-[#fdb22b]" />
              <h2 className="text-xl font-bold text-[#17130d] dark:text-[#f7f3ec]">
                Fila de Aprovação ({filteredQueue.length})
              </h2>
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-medium text-[#574c3d] hover:text-[#f59308] dark:text-[#b8ac9c] dark:hover:text-[#fdb22b] flex items-center gap-1 transition-colors cursor-pointer"
              title="Restaurar lista original de eventos"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar Fila</span>
            </button>
          </div>

          <ApprovalQueue
            events={filteredQueue.map((e) => ({
              id: e.id,
              name: e.name || e.title,
              organizer: e.organizer,
              dateTime: e.dateTime || `${e.date} • ${e.time}`,
              isPaid: e.isPaid,
              location: e.location,
              summary: e.summary,
              link: e.link,
              category: e.category,
              modality: e.modality,
            }))}
            approvedCount={approvedEvents.length}
            onApprove={handleApprove}
            onReject={handleReject}
            onLimitReached={(msg) => setLimitWarning(msg)}
          />
        </section>
      </main>

      <footer className="border-t border-[#ebdcc9] dark:border-[#3b3226] py-6 text-center text-xs text-[#574c3d] dark:text-[#b8ac9c]">
        Tech Events Curitiba • Sistema Profissional de Curadoria e Envio de Eventos de TI
      </footer>
    </div>
  );
}
