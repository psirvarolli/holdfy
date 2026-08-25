import { NextResponse } from "next/server";
import { buildAutoReleaseForAdmin } from "@/lib/server/orders";

// Passo 1 de 2 (ver /submit): monta a transação de resolve-dispute com
// distribuição fixa em 100% pro vendedor (não é uma disputa — é ausência de
// resposta do comprador depois do prazo) e já aplica a assinatura do
// servidor (chave disputeResolver, metade das 2 exigidas). Sem corpo: a
// divisão não é escolhida pelo admin. Protegida pelo proxy.ts (cookie de
// sessão admin).
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const result = await buildAutoReleaseForAdmin(id);
    if (!result) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao montar a liberação automática.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
