import { NextResponse } from "next/server";
import { confirmReceipt } from "@/lib/server/orders";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const order = await confirmReceipt(id);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao confirmar o recebimento.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
