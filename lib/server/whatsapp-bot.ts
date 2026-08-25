import "server-only";

// Chama o bot de WhatsApp (repositório separado, holdfy-whatsapp) pra
// disparar o lembrete de confirmação de recebimento antes da liberação
// automática por prazo — sentido inverso do que já existia (bot -> Holdfy,
// ver lib/server/bot-auth.ts), reaproveitando o mesmo secret compartilhado
// (HOLDFY_BOT_API_SECRET) nos dois sentidos, já que as duas partes são
// operadas pela própria Holdfy.
export async function sendAutoReleaseNudge(params: {
  phone: string;
  orderDisplayId: string;
  daysRemaining: number;
}): Promise<void> {
  const baseUrl = process.env.WHATSAPP_BOT_BASE_URL;
  const secret = process.env.HOLDFY_BOT_API_SECRET;
  if (!baseUrl || !secret) {
    throw new Error("WHATSAPP_BOT_BASE_URL ou HOLDFY_BOT_API_SECRET não configurados.");
  }

  const res = await fetch(`${baseUrl}/internal/nudge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      phone: params.phone,
      orderDisplayId: params.orderDisplayId,
      daysRemaining: params.daysRemaining,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `O bot respondeu ${res.status}.`);
  }
}
