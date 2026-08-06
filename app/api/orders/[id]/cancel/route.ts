import { NextResponse } from "next/server";
import { z } from "zod";
import { cancelOrder } from "@/lib/server/orders";
import { parseJsonBody, userRole } from "@/lib/server/validation";

const schema = z.object({ cancelledBy: userRole });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const order = await cancelOrder(id, parsed.data.cancelledBy);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao cancelar o pedido.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
