import { NextResponse } from "next/server";
import { z } from "zod";
import { respondToDispute, getOrder, resolveOrderRole } from "@/lib/server/orders";
import { parseJsonBody } from "@/lib/server/validation";
import { getSessionAddress } from "@/lib/server/wallet-session";

const schema = z.object({
  response: z.string().trim().min(1).max(1000),
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

  const order = await respondToDispute(id, parsed.data.response, role);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
