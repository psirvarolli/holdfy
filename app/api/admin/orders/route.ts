import { NextResponse } from "next/server";
import { listOrders } from "@/lib/server/orders";

// Protegida pelo proxy.ts (matcher /api/admin/:path*, sessão de admin por
// senha) — não pela sessão de carteira usada nas rotas de pedido do
// vendedor/comprador. O admin precisa ver TODOS os pedidos (pra resolver
// disputas de qualquer um), não só os de uma carteira específica; por isso
// não reaproveita GET /api/orders, que agora é escopado por sessão.
export async function GET() {
  const orders = await listOrders();
  return NextResponse.json({ orders });
}
