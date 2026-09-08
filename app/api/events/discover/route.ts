import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { TechEvent } from '@/types/event';

// Curated backup pool of events in case GEMINI_API_KEY is not configured or fails
const FALLBACK_DISCOVERIES: TechEvent[] = [
  {
    id: 'disc-h1',
    title: 'Hackathon Smart Agro & IoT Paraná',
    organizer: 'Sistema FIEP / Senai Paraná',
    location: 'Campus da Indústria FIEP • Av. Comendador Franco, 1341 - Curitiba/PR',
    date: '25 a 27 de setembro de 2026',
    time: '48h contínuas (Sexta 18h até Domingo 18h)',
    isPaid: false,
    summary: 'Hackathon focado em desenvolver protótipos de internet das coisas (IoT), sensoriamento remoto e visão computacional para o agronegócio paranaense.',
    link: 'https://www.sistemafiep.org.br/',
    ticketsConfirmed: true,
    category: 'hackathon',
    tags: ['IoT', 'Hardware', 'Visão Computacional', 'AgroTech'],
    modality: 'Presencial',
  },
  {
    id: 'disc-h2',
    title: 'Hackathon FinTech & Open Finance Brasil',
    organizer: 'Curitiba Fintech Hub / EBANX Labs',
    location: 'Espaço EBANX • Rua Marechal Deodoro, 630 - Centro, Curitiba/PR',
    date: '06 a 08 de novembro de 2026',
    time: '40 horas de imersão técnica',
    isPaid: false,
    summary: 'Maratona para criar produtos inovadores em meios de pagamento transfronteiriços, prevenção a fraudes com ML e inteligência financeira com Open Finance.',
    link: 'https://business.ebanx.com/',
    ticketsConfirmed: true,
    category: 'hackathon',
    tags: ['Fintech', 'Open Finance', 'Segurança', 'Pagamentos'],
    modality: 'Presencial',
  },
  {
    id: 'disc-p1',
    title: 'Palestra: Engenharia de Plataforma e Kubernetes Interno na Prática',
    organizer: 'DevOps & SRE Community Curitiba',
    location: 'Auditório Sebrae/PR • Rua Caeté, 150 - Prado Velho, Curitiba/PR',
    date: '17 de julho de 2026',
    time: '19:00 às 21:00',
    isPaid: false,
    summary: 'Como grandes times de engenharia constroem Internal Developer Platforms (IDP) para reduzir atrito, acelerar deploys e padronizar observabilidade.',
    link: 'https://www.meetup.com/devops-curitiba/',
    ticketsConfirmed: true,
    category: 'palestra',
    tags: ['Platform Engineering', 'Kubernetes', 'IDP', 'DevOps'],
    modality: 'Presencial',
  },
  {
    id: 'disc-p2',
    title: 'Palestra: Mulheres na Tecnologia & Liderança em Inteligência Artificial',
    organizer: 'Women Techmakers Curitiba / GDG',
    location: 'Engenho da Inovação • Rua Engenheiros Rebouças, 1732',
    date: '08 de agosto de 2026',
    time: '14:00 às 17:30',
    isPaid: false,
    summary: 'Painel com lideranças femininas de engenharia discutindo gestão de produtos orientados a dados, governança de IA, representatividade e mentoria.',
    link: 'https://developers.google.com/womentechmakers',
    ticketsConfirmed: true,
    category: 'palestra',
    tags: ['WTM', 'Diversidade', 'Liderança', 'IA'],
    modality: 'Presencial',
  },
  {
    id: 'disc-w1',
    title: 'Workshop: Desenvolvimento Mobile com Flutter 3 & Clean Architecture',
    organizer: 'Comunidade Flutter CWB',
    location: 'Hub de Inovação Positivo • Rua Prof. Pedro Viriato Parigot de Souza, 5300',
    date: '22 de agosto de 2026',
    time: '09:00 às 16:00',
    isPaid: false,
    summary: 'Crie do zero um aplicativo multiplataforma resiliente utilizando gerência de estado com Bloc, testes automatizados e integração com APIs REST.',
    link: 'https://flutter.dev/',
    ticketsConfirmed: true,
    category: 'workshop',
    tags: ['Flutter', 'Mobile', 'Dart', 'Clean Architecture'],
    modality: 'Presencial',
  },
  {
    id: 'disc-m1',
    title: 'Meetup Rust Curitiba #04 - Concorrência e Alta Performance',
    organizer: 'Rust Paraná User Group',
    location: 'Sede Olist • Rua José Loureiro, 464 - Centro, Curitiba/PR',
    date: '30 de julho de 2026',
    time: '19:00 às 22:00',
    isPaid: false,
    summary: 'Encontro para desenvolvedores Rust abordando async com Tokio, WebAssembly no navegador e interoperabilidade com C/C++.',
    link: 'https://www.rust-lang.org/',
    ticketsConfirmed: true,
    category: 'meetup',
    tags: ['Rust', 'Wasm', 'Backend', 'Sistemas'],
    modality: 'Presencial',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : 'todos';

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Você é um curador especialista em eventos, conferências, palestras e hackathons na área de tecnologia em Curitiba e Brasil.
O usuário está buscando: "${query || 'eventos, hackathons e palestras de tecnologia em Curitiba'}".
Categoria filtrada: "${category}".

Gere uma lista de 4 a 6 eventos de tecnologia relevantes, realistas e específicos (priorize Curitiba/PR e formato presencial ou híbrido).
Para cada evento, forneça:
- id: string única (ex: "gemini-1", "gemini-2", etc.)
- title: nome atraente e técnico do evento
- organizer: empresa, comunidade, universidade ou organizador (ex: Vale do Pinhão, GDG, UTFPR, PUCPR, Sebrae, etc.)
- location: local específico (endereço ou polo em Curitiba, ou "Online")
- date: data no formato "DD de Mês de 2026"
- time: horário do evento (ex: "19:00 às 22:00" ou "08:00 às 18:00")
- isPaid: booleano (true para eventos pagos, false para gratuitos)
- summary: resumo detalhado em português com 2 a 3 frases explicando o que será abordado
- link: URL de inscrição ou comunidade (ex: https://valedopinhao.curitiba.pr.gov.br ou https://www.meetup.com/...)
- ticketsConfirmed: booleano (true se já estiver com inscrições abertas)
- category: exatamente um de ["hackathon", "palestra", "conferencia", "meetup", "workshop"]
- tags: array de 3 a 5 tags (ex: ["IA", "Hackathon", "Cloud"])
- modality: exatamente um de ["Presencial", "Online", "Híbrido"]

Retorne APENAS um objeto JSON no formato:
{
  "events": [...]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                events: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      organizer: { type: Type.STRING },
                      location: { type: Type.STRING },
                      date: { type: Type.STRING },
                      time: { type: Type.STRING },
                      isPaid: { type: Type.BOOLEAN },
                      summary: { type: Type.STRING },
                      link: { type: Type.STRING },
                      ticketsConfirmed: { type: Type.BOOLEAN },
                      category: {
                        type: Type.STRING,
                        enum: ['hackathon', 'palestra', 'conferencia', 'meetup', 'workshop'],
                      },
                      tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      modality: {
                        type: Type.STRING,
                        enum: ['Presencial', 'Online', 'Híbrido'],
                      },
                    },
                    required: ['id', 'title', 'organizer', 'location', 'date', 'time', 'isPaid', 'summary'],
                  },
                },
              },
              required: ['events'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (Array.isArray(parsed.events) && parsed.events.length > 0) {
            return NextResponse.json({
              success: true,
              source: 'gemini',
              events: parsed.events,
            });
          }
        }
      } catch (geminiError) {
        console.warn('Falha na chamada ao Gemini, usando pool de contingência:', geminiError);
      }
    }

    // Fallback if no API key or if Gemini call failed:
    // Filter the fallback discoveries by query or category
    let filtered = FALLBACK_DISCOVERIES;
    if (category && category !== 'todos') {
      filtered = filtered.filter((ev) => ev.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (ev) =>
          ev.title.toLowerCase().includes(q) ||
          ev.summary.toLowerCase().includes(q) ||
          ev.organizer.toLowerCase().includes(q) ||
          ev.tags?.some((t) => t.toLowerCase().includes(q))
      );
      // If query was very specific and matched nothing in fallback, return full pool
      if (filtered.length === 0) {
        filtered = FALLBACK_DISCOVERIES;
      }
    }

    return NextResponse.json({
      success: true,
      source: 'curated_database',
      events: filtered,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro interno ao pesquisar eventos.';
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        events: FALLBACK_DISCOVERIES,
      },
      { status: 500 }
    );
  }
}
