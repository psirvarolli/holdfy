import { NextResponse } from "next/server";
import { buildReleaseFundsTransaction } from "@/lib/server/orders";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await buildReleaseFundsTransaction(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao preparar a liberação.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
