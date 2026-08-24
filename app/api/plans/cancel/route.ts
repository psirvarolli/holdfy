import { NextResponse } from "next/server";
import { cancelProSubscription } from "@/lib/server/plans";
import { getSessionAddress } from "@/lib/server/wallet-session";

// Único uso hoje: o botão "Voltar para o Starter" na tela de Planos. Não
// recebe planSlug no corpo — só existe uma assinatura pra encerrar (a do
// Pro), e ela sempre pertence a quem está logado.
export async function POST(request: Request) {
  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await cancelProSubscription(address);
  return NextResponse.json({ ok: true });
}
