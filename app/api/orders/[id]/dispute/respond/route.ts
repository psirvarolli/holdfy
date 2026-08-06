import { NextResponse } from "next/server";
import { z } from "zod";
import { respondToDispute } from "@/lib/server/orders";
import { parseJsonBody, userRole } from "@/lib/server/validation";

const schema = z.object({
  response: z.string().trim().min(1).max(1000),
  respondedBy: userRole,
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const order = await respondToDispute(id, parsed.data.response, parsed.data.respondedBy);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
