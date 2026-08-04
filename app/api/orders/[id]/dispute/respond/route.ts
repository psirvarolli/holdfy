import { NextResponse } from "next/server";
import { respondToDispute } from "@/lib/server/orders";
import type { UserRole } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { response, respondedBy } = (await request.json()) as {
    response: string;
    respondedBy: UserRole;
  };
  const order = await respondToDispute(id, response, respondedBy);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
