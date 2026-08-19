import { NextResponse } from "next/server";
import { confirmPayment, getOrder } from "@/lib/server/orders";
import { getSessionAddress } from "@/lib/server/wallet-session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const existing = await getOrder(id);
  if (!existing || (existing.sellerAddress !== address && existing.buyerAddress !== address)) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  try {
    const order = await confirmPayment(id);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao confirmar o pagamento.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
