import { NextResponse } from "next/server";
import { listOrders, createOrder, type NewOrderInput } from "@/lib/server/orders";

export async function GET() {
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  // TODO: validar a sessão real (Privy) e usar o comprador autenticado em vez
  // de um campo de texto livre para o nome do comprador.
  const input = (await request.json()) as NewOrderInput;
  const order = await createOrder(input);
  return NextResponse.json({ order }, { status: 201 });
}
