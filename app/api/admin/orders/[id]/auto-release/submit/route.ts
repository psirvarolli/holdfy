import { NextResponse } from "next/server";
import { z } from "zod";
import { submitAutoReleaseForAdmin } from "@/lib/server/orders";
import { parseJsonBody } from "@/lib/server/validation";

const schema = z.object({
  signedTransaction: z.string().min(1),
});

// Passo 2 de 2: recebe o XDR já com as 2 assinaturas (servidor + a pessoal
// de quem operou o painel, colhida no navegador via Freighter) e envia pra
// Trustless Work. Protegida pelo proxy.ts (cookie de sessão admin).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const order = await submitAutoReleaseForAdmin(id, parsed.data.signedTransaction);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao enviar a liberação automática.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
