import { NextResponse } from "next/server";
import { z } from "zod";
import { buildPaymentTransaction } from "@/lib/server/orders";
import { parseJsonBody, stellarAddress } from "@/lib/server/validation";

const schema = z.object({ buyerAddress: stellarAddress });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await buildPaymentTransaction(id, parsed.data.buyerAddress);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao preparar o pagamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
