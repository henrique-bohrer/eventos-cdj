import { NextResponse } from "next/server";

interface ApprovedEvent {
  name?: string;
  title?: string;
  isPaid: boolean;
  dateTime?: string;
  organizer?: string;
  location?: string;
  link?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const events: ApprovedEvent[] = Array.isArray(body?.events) ? body.events : [];

    if (events.length === 0) {
      return NextResponse.json(
        { error: "Nenhum evento para enviar no resumo." },
        { status: 400 }
      );
    }

    const description = events
      .map((e) => {
        const eventName = e.name || e.title || "Evento sem título";
        const status = e.isPaid ? "Pago" : "Gratuito";
        const details = e.dateTime ? ` (${e.dateTime})` : "";
        return `• **${eventName}** — ${status}${details}`;
      })
      .join("\n\n");

    const payload = {
      embeds: [
        {
          title: "Eventos de tecnologia em Curitiba",
          description,
          color: 0x6366f1,
          footer: {
            text: "Tech Events Curitiba • Resumo de Destaques",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Webhook não configurado. Adicione DISCORD_WEBHOOK_URL nas variáveis de ambiente." },
        { status: 500 }
      );
    }

    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordResponse.ok) {
      const errText = await discordResponse.text();
      return NextResponse.json(
        { error: `Erro retornado pelo Discord: ${errText || discordResponse.statusText}` },
        { status: discordResponse.status }
      );
    }

    return NextResponse.json({ ok: discordResponse.ok, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno no servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
