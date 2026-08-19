import { NextResponse } from "next/server";
import { buildPaymentTransaction } from "@/lib/server/orders";
import { getSessionAddress } from "@/lib/server/wallet-session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    // buyerAddress vem sempre da sessão verificada, nunca do corpo — é quem
    // está logado que está pagando, ponto.
    const result = await buildPaymentTransaction(id, address);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao preparar o pagamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
