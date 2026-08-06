import { NextResponse } from "next/server";
import { z } from "zod";
import { openDispute } from "@/lib/server/orders";
import { parseJsonBody, userRole } from "@/lib/server/validation";

const schema = z.object({
  reason: z.string().trim().min(1).max(500),
  openedBy: userRole,
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const order = await openDispute(id, parsed.data.reason, parsed.data.openedBy);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao abrir a disputa.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
