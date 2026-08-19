import { NextResponse } from "next/server";
import { z } from "zod";
import { openDispute, getOrder, resolveOrderRole } from "@/lib/server/orders";
import { parseJsonBody } from "@/lib/server/validation";
import { getSessionAddress } from "@/lib/server/wallet-session";

const schema = z.object({
  reason: z.string().trim().min(1).max(500),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const existing = await getOrder(id);
  const role = existing ? resolveOrderRole(existing, address) : null;
  if (!role) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const order = await openDispute(id, parsed.data.reason, role);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao abrir a disputa.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
