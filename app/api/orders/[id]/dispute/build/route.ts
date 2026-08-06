import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDisputeTransaction } from "@/lib/server/orders";
import { parseJsonBody, userRole } from "@/lib/server/validation";

const schema = z.object({ openedBy: userRole });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await buildDisputeTransaction(id, parsed.data.openedBy);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao preparar a disputa.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
