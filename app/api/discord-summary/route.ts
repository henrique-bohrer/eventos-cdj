import { NextResponse } from "next/server";

interface ApprovedEvent {
  id?: string;
  name?: string;
  title?: string;
  isPaid: boolean;
  date?: string;
  time?: string;
  dateTime?: string;
  organizer?: string;
  location?: string;
  summary?: string;
  link?: string;
}

function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("www.") || trimmed.includes(".")) {
    return `https://${trimmed}`;
  }
  return undefined;
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

    // Build embeds matching exactly the requested structure
    const embeds = events.map((e) => {
      const cleanName = (e.name || e.title || "Evento de Tecnologia").replace(/^👉\s*/, "").trim();
      const title = `👉 ${cleanName}`;
      const organizer = e.organizer || "Comunidade Tech Curitiba";
      const summary = e.summary || "Confira os detalhes e a programação no link oficial do evento.";
      const description = `Organizador: ${organizer}\n\n${summary}`;

      const rawDate =
        e.date ||
        (e.dateTime?.includes("•") ? e.dateTime.split("•")[0].trim() : e.dateTime) ||
        "Em breve";

      const rawTime =
        e.time ||
        (e.dateTime?.includes("•") ? e.dateTime.split("•")[1].trim() : "") ||
        "A definir";

      const location = e.location || "Curitiba/PR";
      const statusText = e.isPaid ? "💰 Evento Pago" : "🎁 Evento Gratuito";
      const validLink = normalizeUrl(e.link);

      return {
        title,
        url: validLink || undefined,
        description,
        color: 0xf59308, // Gold / Amber matching the theme
        fields: [
          {
            name: "💰 Valor / Status",
            value: statusText,
            inline: false,
          },
          {
            name: "📆 Data",
            value: rawDate,
            inline: true,
          },
          {
            name: "⏱ Horário",
            value: rawTime,
            inline: true,
          },
          {
            name: "📍 Local",
            value: location,
            inline: false,
          },
          {
            name: "🔗 Inscrições / Mais Informações",
            value: validLink ? `[Acessar Evento](${validLink})` : "Consulte os organizadores",
            inline: false,
          },
        ],
        footer: {
          text: "Tech Events Curitiba • Agenda de Eventos",
        },
        timestamp: new Date().toISOString(),
      };
    });

    // Build Discord Link Buttons (Components V2 style 5)
    const buttonComponents: Array<{
      type: number;
      components: Array<{
        type: number;
        style: number;
        label: string;
        url: string;
        emoji?: { name: string };
      }>;
    }> = [];

    events.forEach((e) => {
      const validLink = normalizeUrl(e.link);
      if (validLink) {
        const rawName = (e.name || e.title || "").replace(/^👉\s*/, "").trim();
        const shortName = rawName.length > 50 ? `${rawName.slice(0, 47)}...` : rawName;
        const label = events.length === 1 ? "Acessar Evento" : `Acessar: ${shortName}`;

        buttonComponents.push({
          type: 1, // Action Row
          components: [
            {
              type: 2, // Button
              style: 5, // Link (URL)
              label,
              url: validLink,
              emoji: { name: "🔗" },
            },
          ],
        });
      }
    });

    const webhookUrl = body?.webhookUrl || process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        {
          error:
            "Webhook não configurado. Adicione a variável DISCORD_WEBHOOK_URL nas configurações de ambiente.",
        },
        { status: 500 }
      );
    }

    const basePayload = {
      username: "Eventos CDJ",
      content:
        "🎙🚨 **AGENDA DE EVENTOS DE TECNOLOGIA - CURITIBA** 🚨🎙\nConfira abaixo os resumos dos eventos aprovados para nossa comunidade:",
      embeds,
    };

    let discordResponse: Response;

    // First attempt: with button components (if any link exists)
    if (buttonComponents.length > 0) {
      let targetUrl = webhookUrl;
      try {
        const parsed = new URL(webhookUrl);
        parsed.searchParams.set("with_components", "true");
        targetUrl = parsed.toString();
      } catch {
        targetUrl = webhookUrl;
      }

      discordResponse = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basePayload,
          components: buttonComponents,
        }),
      });

      // If Discord rejected components with 400, automatically fallback to standard embeds without components
      if (!discordResponse.ok && discordResponse.status === 400) {
        discordResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(basePayload),
        });
      }
    } else {
      discordResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });
    }

    if (!discordResponse.ok) {
      const errText = await discordResponse.text();
      return NextResponse.json(
        { error: `Erro retornado pelo Discord: ${errText || discordResponse.statusText}` },
        { status: discordResponse.status }
      );
    }

    return NextResponse.json({
      ok: true,
      success: true,
      count: events.length,
      hasButtons: buttonComponents.length > 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno no servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
