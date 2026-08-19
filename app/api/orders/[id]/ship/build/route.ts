import { NextResponse } from "next/server";
import { z } from "zod";
import { buildShipmentTransaction, getOrder } from "@/lib/server/orders";
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
    const result = await buildShipmentTransaction(id, parsed.data.trackingCode ?? "");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao preparar o envio.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
