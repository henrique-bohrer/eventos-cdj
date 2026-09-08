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
    const embeds = events.map((event) => {
      const statusBadge = event.isPaid ? '💰 Evento Pago' : '🎁 Evento Gratuito';
      const color = event.isPaid ? 16534594 : 3066993; // Red vs Green color in decimal

      const fields = [
        {
          name: '💰 Valor / Status',
          value: statusBadge,
          inline: true,
        },
        {
          name: '📆 Data',
          value: event.date,
          inline: true,
        },
        {
          name: '⏱ Horário',
          value: event.time,
          inline: true,
        },
        {
          name: '📍 Local',
          value: event.location,
          inline: false,
        },
      ];

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
