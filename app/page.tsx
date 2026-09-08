'use client';

import React, { useState, useMemo } from 'react';
import { INITIAL_EVENTS } from '@/data/events';
import { TechEvent, EventCategory } from '@/types/event';
import { Header } from '@/components/Header';
import { SuggestedEventCard } from '@/components/SuggestedEventCard';
import { ApprovedEventCard } from '@/components/ApprovedEventCard';
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
  Search,
  X,
  Trophy,
  Mic,
  Users,
  Globe,
  Code2,
  Compass,
} from 'lucide-react';

export default function Home() {
  const [suggestedEvents, setSuggestedEvents] = useState<TechEvent[]>(INITIAL_EVENTS);
  const [approvedEvents, setApprovedEvents] = useState<TechEvent[]>([]);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'todos'>('todos');
  const [priceFilter, setPriceFilter] = useState<'todos' | 'gratis' | 'pago'>('todos');

  // AI Event Discovery state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryTopic, setDiscoveryTopic] = useState('');
  const [showDiscoveryBar, setShowDiscoveryBar] = useState(false);
  const [discoveryFeedback, setDiscoveryFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  // Status state for Discord Webhook sending
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: suggestedEvents.length,
      hackathon: 0,
      palestra: 0,
      workshop: 0,
      conferencia: 0,
      meetup: 0,
    };
    suggestedEvents.forEach((ev) => {
      if (ev.category && counts[ev.category] !== undefined) {
        counts[ev.category]++;
      }
    });
    return counts;
  }, [suggestedEvents]);

  // Filtered suggested events
  const filteredEvents = useMemo(() => {
    return suggestedEvents.filter((ev) => {
      // Category match
      if (selectedCategory !== 'todos' && ev.category !== selectedCategory) {
        return false;
      }

      // Price filter match
      if (priceFilter === 'gratis' && ev.isPaid) return false;
      if (priceFilter === 'pago' && !ev.isPaid) return false;

      // Text search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchOrganizer = ev.organizer.toLowerCase().includes(q);
        const matchSummary = ev.summary.toLowerCase().includes(q);
        const matchLocation = ev.location.toLowerCase().includes(q);
        const matchCategory = ev.category?.toLowerCase().includes(q);
        const matchTags = ev.tags?.some((t) => t.toLowerCase().includes(q));

        if (!matchTitle && !matchOrganizer && !matchSummary && !matchLocation && !matchTags && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [suggestedEvents, selectedCategory, priceFilter, searchQuery]);

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
    setSearchQuery('');
    setSelectedCategory('todos');
    setPriceFilter('todos');
    setDiscoveryFeedback(null);
  };

  const handleDiscoverNewEvents = async (customQuery?: string) => {
    const queryToSearch = customQuery !== undefined ? customQuery : (discoveryTopic || searchQuery);
    setIsDiscovering(true);
    setDiscoveryFeedback(null);

    try {
      const res = await fetch('/api/events/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryToSearch,
          category: selectedCategory !== 'todos' ? selectedCategory : undefined,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        // Collect existing IDs to avoid duplicates
        const existingIds = new Set([
          ...suggestedEvents.map((e) => e.id),
          ...approvedEvents.map((e) => e.id),
          ...suggestedEvents.map((e) => e.title.toLowerCase()),
          ...approvedEvents.map((e) => e.title.toLowerCase()),
        ]);

        const newEvents: TechEvent[] = data.events.filter(
          (e: TechEvent) => !existingIds.has(e.id) && !existingIds.has(e.title.toLowerCase())
        );

        if (newEvents.length > 0) {
          setSuggestedEvents((prev) => [...newEvents, ...prev]);
          setDiscoveryFeedback({
            type: 'success',
            text: `Encontramos ${newEvents.length} nova(s) opção(ões) de eventos adicionadas às sugestões!`,
          });
        } else {
          setDiscoveryFeedback({
            type: 'info',
            text: 'Os eventos localizados para esse termo já constam na sua lista atual.',
          });
        }
      } else {
        setDiscoveryFeedback({
          type: 'info',
          text: 'Nenhum evento adicional foi encontrado no momento para este filtro.',
        });
      }
    } catch {
      setDiscoveryFeedback({
        type: 'error',
        text: 'Não foi possível conectar à busca de eventos no momento. Tente novamente.',
      });
    } finally {
      setIsDiscovering(false);
    }
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

  return (
    <div className="min-h-screen flex flex-col">
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
            className={`rounded-xl border p-4 shadow-md flex items-start justify-between gap-3 ${
              statusMessage.type === 'success'
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

        {/* SEARCH & FILTERS CONTROLS BAR */}
        <section className="rounded-2xl border border-[#ebdcc9] dark:border-[#3b3226] bg-white dark:bg-[#241e16] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#786b59] dark:text-[#a89b8b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar eventos, hackathons, palestras, temas (ex: IA, Python, Cloud)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-[#fcf8f0] dark:bg-[#1a150e] border border-[#ebdcc9] dark:border-[#3b3226] text-[#17130d] dark:text-[#f7f3ec] placeholder:text-[#8c7e6c] dark:placeholder:text-[#807466] focus:outline-none focus:border-[#f59308] dark:focus:border-[#fdb22b] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c7e6c] hover:text-[#17130d] dark:hover:text-[#f7f3ec] p-1 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action: Toggle AI Discovery Panel */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDiscoveryBar(!showDiscoveryBar)}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  showDiscoveryBar
                    ? 'bg-[#f59308] text-[#17130d] border-[#f59308]'
                    : 'bg-[#fffcf5] dark:bg-[#2e261d] text-[#17130d] dark:text-[#f7f3ec] border-[#ebdcc9] dark:border-[#3b3226] hover:border-[#f59308]'
                }`}
              >
                <Compass className="w-4 h-4 text-[#f59308] dark:text-[#fdb22b]" />
                <span>Explorar Mais Opções (IA)</span>
              </button>

              {/* Price Filter Dropdown / Buttons */}
              <div className="flex items-center rounded-xl bg-[#fcf8f0] dark:bg-[#1a150e] p-1 border border-[#ebdcc9] dark:border-[#3b3226] text-xs font-semibold">
                <button
                  onClick={() => setPriceFilter('todos')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    priceFilter === 'todos'
                      ? 'bg-white dark:bg-[#2b241b] text-[#17130d] dark:text-[#f7f3ec] shadow-xs'
                      : 'text-[#61584c] dark:text-[#b8ac9c]'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setPriceFilter('gratis')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    priceFilter === 'gratis'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-[#61584c] dark:text-[#b8ac9c]'
                  }`}
                >
                  Gratuitos
                </button>
                <button
                  onClick={() => setPriceFilter('pago')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    priceFilter === 'pago'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-[#61584c] dark:text-[#b8ac9c]'
                  }`}
                >
                  Pagos
                </button>
              </div>
            </div>
          </div>

          {/* CATEGORY CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold scrollbar-none">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'todos'
                  ? 'bg-[#17130d] text-white dark:bg-[#f7f3ec] dark:text-[#17130d] border-[#17130d] dark:border-[#f7f3ec]'
                  : 'bg-[#fffcf5] dark:bg-[#1f1912] text-[#61584c] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-[#f59308]'
              }`}
            >
              <span>Todos</span>
              <span className="text-[11px] opacity-75">({categoryCounts.todos})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('hackathon')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'hackathon'
                  ? 'bg-purple-700 text-white border-purple-700 dark:bg-purple-600'
                  : 'bg-[#fffcf5] dark:bg-[#1f1912] text-[#61584c] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-purple-400'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-purple-500" />
              <span>Hackathons</span>
              <span className="text-[11px] opacity-75">({categoryCounts.hackathon})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('palestra')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'palestra'
                  ? 'bg-sky-700 text-white border-sky-700 dark:bg-sky-600'
                  : 'bg-[#fffcf5] dark:bg-[#1f1912] text-[#61584c] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-sky-400'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-sky-500" />
              <span>Palestras</span>
              <span className="text-[11px] opacity-75">({categoryCounts.palestra})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('workshop')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'workshop'
                  ? 'bg-indigo-700 text-white border-indigo-700 dark:bg-indigo-600'
                  : 'bg-[#fffcf5] dark:bg-[#1f1912] text-[#61584c] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-indigo-400'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Workshops</span>
              <span className="text-[11px] opacity-75">({categoryCounts.workshop})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('conferencia')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'conferencia'
                  ? 'bg-amber-700 text-white border-amber-700 dark:bg-amber-600'
                  : 'bg-[#fffcf5] dark:bg-[#1f1912] text-[#61584c] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-amber-400'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>Conferências</span>
              <span className="text-[11px] opacity-75">({categoryCounts.conferencia})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('meetup')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'meetup'
                  ? 'bg-emerald-700 text-white border-emerald-700 dark:bg-emerald-600'
                  : 'bg-[#fffcf5] dark:bg-[#1f1912] text-[#61584c] dark:text-[#b8ac9c] border-[#ebdcc9] dark:border-[#3b3226] hover:border-emerald-400'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Meetups</span>
              <span className="text-[11px] opacity-75">({categoryCounts.meetup})</span>
            </button>
          </div>

          {/* AI EVENT DISCOVERY COLLAPSIBLE BAR */}
          {showDiscoveryBar && (
            <div className="pt-3 border-t border-[#ebdcc9] dark:border-[#3b3226] bg-[#fcf8f0] dark:bg-[#1f1912] p-4 rounded-xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#17130d] dark:text-[#f7f3ec]">
                  <Sparkles className="w-4 h-4 text-[#f59308] dark:text-[#fdb22b]" />
                  <span>Pesquisar e Descobrir Novos Eventos de Tecnologia</span>
                </div>
                <button
                  onClick={() => setShowDiscoveryBar(false)}
                  className="text-xs text-[#786b59] hover:text-[#17130d] dark:hover:text-white"
                >
                  Fechar
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={discoveryTopic}
                  onChange={(e) => setDiscoveryTopic(e.target.value)}
                  placeholder="Ex: Hackathon de Cidades Inteligentes, Palestra sobre IA Generativa, Cloud..."
                  className="flex-1 px-3.5 py-2 rounded-lg text-xs sm:text-sm bg-white dark:bg-[#140f09] border border-[#ebdcc9] dark:border-[#3b3226] text-[#17130d] dark:text-[#f7f3ec] focus:outline-none focus:border-[#f59308]"
                />
                <button
                  onClick={() => handleDiscoverNewEvents()}
                  disabled={isDiscovering}
                  className="px-4 py-2 rounded-lg bg-[#f59308] text-[#17130d] font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isDiscovering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Buscando Opções...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Buscar Novos Eventos</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-[#574c3d] dark:text-[#b8ac9c]">
                <span className="font-semibold">Sugestões rápidas:</span>
                {[
                  'Hackathon de IA & GovTech',
                  'Palestras de Cloud & DevOps',
                  'Workshop de Flutter & Mobile',
                  'Meetup de Python & Dados',
                ].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setDiscoveryTopic(sug);
                      handleDiscoverNewEvents(sug);
                    }}
                    className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs text-[#17130d] dark:text-[#f7f3ec] transition-colors cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>

              {/* Discovery feedback alert */}
              {discoveryFeedback && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    discoveryFeedback.type === 'success'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                      : discoveryFeedback.type === 'info'
                      ? 'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800'
                      : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  {discoveryFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Info className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  )}
                  <span>{discoveryFeedback.text}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Main 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Suggested Events Section (2 Columns grid on medium+) */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#ebdcc9] dark:border-[#3b3226] pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-5 h-5 text-[#f59308] dark:text-[#fdb22b]" />
                <h2 className="text-xl font-bold text-[#211c15] dark:text-[#f7f3ec]">
                  Sugestões de Eventos de TI
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ebdcc9]/50 dark:bg-[#3b3226] text-[#61584c] dark:text-[#b8ac9c]">
                  {filteredEvents.length} exibidos ({suggestedEvents.length} no total)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetList}
                  className="text-xs font-medium text-[#61584c] dark:text-[#b8ac9c] hover:text-[#f59308] dark:hover:text-[#fdb22b] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Restaurar eventos originais de Curitiba"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restaurar Lista</span>
                </button>
              </div>
            </div>

            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((event) => (
                  <SuggestedEventCard
                    key={event.id}
                    event={event}
                    onApprove={handleApproveEvent}
                    onReject={handleRejectEvent}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#ebdcc9] dark:border-[#3b3226] p-8 text-center bg-white/50 dark:bg-[#241e16]/50 space-y-3">
                <Info className="w-8 h-8 mx-auto text-[#61584c] dark:text-[#b8ac9c]" />
                <h3 className="text-base font-bold text-[#17130d] dark:text-[#f7f3ec]">
                  Nenhum evento corresponde aos filtros atuais
                </h3>
                <p className="text-xs sm:text-sm text-[#61584c] dark:text-[#b8ac9c] max-w-md mx-auto">
                  Tente alterar o termo da pesquisa, trocar a categoria ou usar a busca por inteligência artificial para localizar novos eventos, palestras e hackathons.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('todos');
                      setPriceFilter('todos');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#ebdcc9] dark:border-[#3b3226] text-xs font-semibold text-[#17130d] dark:text-[#f7f3ec] hover:border-[#f59308] cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                  <button
                    onClick={() => {
                      setShowDiscoveryBar(true);
                      handleDiscoverNewEvents();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#f59308] text-[#17130d] font-bold text-xs hover:opacity-90 cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5" /> Descobrir Novos Eventos (IA)
                  </button>
                </div>
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
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  approvedEvents.length >= 4
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
                  Nenhum evento aprovado ainda. Clique em &quot;SIM&quot; nos cards de sugestão para adicionar até 4 eventos aqui.
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
        Tech Events Curitiba • Agenda de Eventos, Palestras & Hackathons de TI
      </footer>
    </div>
  );
}
