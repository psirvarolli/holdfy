import { NextResponse } from "next/server";
import { z } from "zod";
import { markShipped, getOrder } from "@/lib/server/orders";
import { parseJsonBody } from "@/lib/server/validation";
import { getSessionAddress } from "@/lib/server/wallet-session";

const schema = z.object({ trackingCode: z.string().trim().max(60).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const existing = await getOrder(id);
  if (!existing || existing.sellerAddress !== address) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const order = await markShipped(id, parsed.data.trackingCode ?? "");
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao confirmar o envio.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
