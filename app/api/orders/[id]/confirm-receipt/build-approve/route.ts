import { NextResponse } from "next/server";
import { buildApproveReceiptTransaction } from "@/lib/server/orders";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await buildApproveReceiptTransaction(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao preparar a confirmação.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
