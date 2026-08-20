import { NextResponse } from "next/server";
import { getSellerPlanStatus } from "@/lib/server/plans";
import { getSessionAddress } from "@/lib/server/wallet-session";

// sellerAddress vem sempre da sessão verificada, nunca de um parâmetro da
// URL — antes disso, qualquer um conseguia consultar o plano/assinatura de
// qualquer vendedor só sabendo o endereço da carteira dele.
export async function GET(request: Request) {
  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const status = await getSellerPlanStatus(address);
  return NextResponse.json({ status });
}
