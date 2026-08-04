import { NextResponse } from "next/server";
import { markShipped } from "@/lib/server/orders";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { trackingCode } = (await request.json()) as { trackingCode?: string };
  const order = await markShipped(id, trackingCode ?? "");
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
