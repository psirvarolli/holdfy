import { NextResponse } from "next/server";
import { getOrder } from "@/lib/server/orders";

// Protegida pelo proxy.ts, não pela sessão de carteira — ver comentário em
// ../route.ts.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
