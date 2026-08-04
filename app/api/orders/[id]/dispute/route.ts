import { NextResponse } from "next/server";
import { openDispute } from "@/lib/server/orders";
import type { UserRole } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { reason, openedBy } = (await request.json()) as { reason: string; openedBy: UserRole };
  const order = await openDispute(id, reason, openedBy);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
