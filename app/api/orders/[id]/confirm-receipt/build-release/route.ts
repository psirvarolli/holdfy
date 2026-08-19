import { NextResponse } from "next/server";
import { buildReleaseFundsTransaction, getOrder } from "@/lib/server/orders";
import { getSessionAddress } from "@/lib/server/wallet-session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const existing = await getOrder(id);
  if (!existing || existing.buyerAddress !== address) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  try {
    const result = await buildReleaseFundsTransaction(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao preparar a liberação.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
