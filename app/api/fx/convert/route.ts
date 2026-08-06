import { NextResponse } from "next/server";
import { convertBrlToUsdc } from "@/lib/server/fx-rate";

// Só para preview no cliente (ex: "este pedido custa ~X USDC" antes de
// pagar) — o valor que realmente conta é convertido de novo, e travado no
// pedido, dentro de buildPaymentTransaction em lib/server/orders.ts.
export async function GET(request: Request) {
  const brlParam = new URL(request.url).searchParams.get("brl");
  const brl = Number(brlParam);
  if (!brlParam || !Number.isFinite(brl) || brl < 0) {
    return NextResponse.json({ error: "Parâmetro 'brl' inválido." }, { status: 400 });
  }

  try {
    const usdc = await convertBrlToUsdc(brl);
    return NextResponse.json({ usdc });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar a cotação.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
