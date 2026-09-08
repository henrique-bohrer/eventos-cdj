import { NextRequest, NextResponse } from 'next/server';
import { TechEvent } from '@/types/event';

export async function POST(request: NextRequest) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            'A variável DISCORD_WEBHOOK_URL não está configurada. Adicione a URL do Webhook do Discord no menu Settings (Configurações) do AI Studio ou em seu arquivo .env.local.',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const events: TechEvent[] = body.events;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum evento aprovado fornecido para envio.',
        },
        { status: 400 }
      );
    }

    // Prepare Discord Embeds payload
    const categoryLabels: Record<string, string> = {
      hackathon: '🏆 Hackathon',
      palestra: '🎤 Palestra',
      conferencia: '🌐 Conferência',
      meetup: '👥 Meetup',
      workshop: '💻 Workshop',
    };

    const embeds = events.map((event) => {
      const statusBadge = event.isPaid ? '💰 Evento Pago' : '🎁 Evento Gratuito';
      const color = event.category === 'hackathon'
        ? 10181046 // Purple
        : event.category === 'palestra'
        ? 3447003 // Sky blue
        : event.isPaid
        ? 16534594 // Red
        : 3066993; // Green

      const fields = [
        {
          name: '🏷 Tipo & Modalidade',
          value: `${event.category ? categoryLabels[event.category] || event.category : 'Evento'} • ${event.modality || 'Presencial'}`,
          inline: true,
        },
        {
          name: '💰 Valor / Status',
          value: statusBadge,
          inline: true,
        },
        {
          name: '📆 Data & Horário',
          value: `${event.date} (${event.time})`,
          inline: true,
        },
        {
          name: '📍 Local',
          value: event.location,
          inline: false,
        },
      ];

      if (event.tags && event.tags.length > 0) {
        fields.push({
          name: '🏷 Tags',
          value: event.tags.map((t) => `#${t}`).join(' '),
          inline: false,
        });
      }

      if (event.link) {
        fields.push({
          name: '🔗 Inscrições / Mais Informações',
          value: `[Acessar Evento](${event.link})`,
          inline: false,
        });
      }

      return {
        title: `👉 ${event.title}`,
        description: `**Organizador:** ${event.organizer}\n\n${event.summary}`,
        color: color,
        fields: fields,
        footer: {
          text: 'Tech Events Curitiba • Agenda de Eventos',
        },
        timestamp: new Date().toISOString(),
      };
    });

    const discordPayload = {
      content: '🎙🚨 **AGENDA DE EVENTOS DE TECNOLOGIA - CURITIBA** 🚨🎙\nConfira abaixo os resumos dos eventos aprovados para nossa comunidade:',
      embeds: embeds,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao enviar para o Discord: status HTTP ${response.status}. Detalhes: ${errorText}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${events.length} evento(s) enviado(s) com sucesso para o Discord!`,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro interno no servidor.';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
