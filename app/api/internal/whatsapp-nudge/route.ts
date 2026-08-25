import { NextResponse } from "next/server";
import {
  listOrdersNeedingAutoReleaseNudge,
  markAutoReleaseNudgeProcessed,
  daysUntilAutoRelease,
} from "@/lib/server/orders";
import { sendAutoReleaseNudge } from "@/lib/server/whatsapp-bot";

// Chamada pelo Cron Job diário definido em vercel.json. Avisa o comprador
// alguns dias antes da liberação automática por prazo (ver AUTO_RELEASE_DAYS
// em lib/server/orders.ts), dando uma chance real de confirmar ou contestar
// antes de o valor ir pro vendedor sozinho.
//
// Pedidos sem buyerPhone marcam o lembrete como processado mesmo sem enviar
// (não tem como corrigir isso tentando de novo); uma falha ao chamar o bot
// (rede, template não configurado etc.) NÃO marca — tenta de novo amanhã.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const orders = await listOrdersNeedingAutoReleaseNudge();
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const order of orders) {
    if (!order.buyerPhone) {
      await markAutoReleaseNudgeProcessed(order.id);
      skipped++;
      continue;
    }
    try {
      await sendAutoReleaseNudge({
        phone: order.buyerPhone,
        orderDisplayId: order.displayId,
        daysRemaining: daysUntilAutoRelease(order.shippedAt!),
      });
      await markAutoReleaseNudgeProcessed(order.id);
      sent++;
    } catch (error) {
      failed++;
      console.error(`Falha ao mandar o lembrete do pedido ${order.displayId}:`, error);
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, failed });
}
