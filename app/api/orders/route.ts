import { NextResponse } from "next/server";
import { z } from "zod";
import { listOrders, createOrder } from "@/lib/server/orders";
import { parseJsonBody, stellarAddress, money } from "@/lib/server/validation";

export async function GET() {
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

const newOrderSchema = z.object({
  counterpartyName: z.string().trim().min(1).max(120),
  itemName: z.string().trim().min(1).max(200),
  price: money.positive(),
  hasShipping: z.boolean(),
  shippingCost: money.nonnegative(),
  sourceUrl: z.string().url().max(2000).optional(),
  sourceMarketplace: z.string().trim().max(60).optional(),
  sellerAddress: stellarAddress.optional(),
});

export async function POST(request: Request) {
  // TODO: validar a sessão real (Pollar) e usar o comprador autenticado em vez
  // de um campo de texto livre para o nome do comprador.
  const parsed = await parseJsonBody(request, newOrderSchema);
  if ("error" in parsed) return parsed.error;

  const order = await createOrder(parsed.data);
  return NextResponse.json({ order }, { status: 201 });
}
