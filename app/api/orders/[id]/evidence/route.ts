import { NextResponse } from "next/server";
import { z } from "zod";
import { addEvidence } from "@/lib/server/evidence";
import { getOrder } from "@/lib/server/orders";
import { evidenceStage, evidenceType, userRole, parseJsonBody } from "@/lib/server/validation";
import { getSessionAddress } from "@/lib/server/wallet-session";

const schema = z.object({
  stage: evidenceStage,
  type: evidenceType,
  url: z.string().url(),
  uploadedBy: userRole,
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const order = await getOrder(id);
  if (!order || (order.sellerAddress !== address && order.buyerAddress !== address)) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    await addEvidence(id, parsed.data.stage, parsed.data.type, parsed.data.url, parsed.data.uploadedBy);
    const order = await getOrder(id);
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao registrar a evidência.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
