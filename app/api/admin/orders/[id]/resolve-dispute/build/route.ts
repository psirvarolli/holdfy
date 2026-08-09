import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDisputeResolutionForAdmin } from "@/lib/server/orders";
import { parseJsonBody, money } from "@/lib/server/validation";

const schema = z.object({
  buyerAmount: money.nonnegative(),
  sellerAmount: money.nonnegative(),
});

// Passo 1 de 2 (ver /submit): monta a transação de resolve-dispute e já
// aplica a assinatura do servidor (chave disputeResolver, metade das 2
// exigidas). Protegida pelo proxy.ts (cookie de sessão admin).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await buildDisputeResolutionForAdmin(id, parsed.data.buyerAmount, parsed.data.sellerAmount);
    if (!result) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao montar a resolução da disputa.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
