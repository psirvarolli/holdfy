import { NextResponse } from "next/server";
import { z } from "zod";
import { createPaymentLink } from "@/lib/server/infinitepay";
import { getPlanBySlug, encodeProOrderNsu } from "@/lib/server/plans";
import { stellarAddress, planSlug, parseJsonBody } from "@/lib/server/validation";

// Só o Pro tem link de pagamento automático — Starter não cobra nada e
// Enterprise é negociado diretamente com a Holdfy (botão "Fale conosco" na
// tela de Planos), sem gerar link nenhum aqui.
const schema = z.object({
  sellerAddress: stellarAddress,
  planSlug: planSlug.refine((slug) => slug === "pro", "Este plano não tem pagamento automático."),
});

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const plan = await getPlanBySlug(parsed.data.planSlug);
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const orderNsu = encodeProOrderNsu(parsed.data.sellerAddress);

  try {
    const { url } = await createPaymentLink({
      orderNsu,
      redirectUrl: `${origin}/plans?checkout=retorno`,
      webhookUrl: `${origin}/api/infinitepay/webhook`,
      items: [
        {
          quantity: 1,
          // InfinitePay trabalha em centavos.
          price: Math.round(plan.monthlyPriceReais * 100),
          description: "Assinatura Holdfy Pro (30 dias)",
        },
      ],
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao gerar o link de pagamento.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
