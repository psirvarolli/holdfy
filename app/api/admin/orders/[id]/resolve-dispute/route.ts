import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveDisputeAdmin } from "@/lib/server/orders";
import { parseJsonBody, money } from "@/lib/server/validation";

const schema = z.object({
  buyerAmount: money.nonnegative(),
  sellerAmount: money.nonnegative(),
});

// Protegida pelo proxy.ts (exige o cookie de sessão admin) — ver
// lib/server/admin-auth.ts.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const order = await resolveDisputeAdmin(id, parsed.data.buyerAmount, parsed.data.sellerAmount);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao resolver a disputa.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
