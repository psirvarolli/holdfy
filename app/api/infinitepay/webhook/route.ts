import { NextResponse } from "next/server";
import { checkPayment } from "@/lib/server/infinitepay";
import { recordProPayment } from "@/lib/server/plans";

// O webhook da InfinitePay não tem verificação de assinatura documentada —
// então o payload em si NUNCA é a fonte de verdade aqui, só um aviso de
// "algo pode ter acontecido, vá conferir". A confirmação real vem de
// checkPayment(), que consulta a própria InfinitePay pelo order_nsu (que só
// a Holdfy gera — ver encodeProOrderNsu) antes de estender qualquer acesso.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const orderNsu = body?.order_nsu;
  if (typeof orderNsu !== "string") {
    return NextResponse.json({ error: "order_nsu ausente." }, { status: 400 });
  }

  const verified = await checkPayment({
    orderNsu,
    slug: typeof body?.invoice_slug === "string" ? body.invoice_slug : undefined,
    transactionNsu: typeof body?.transaction_nsu === "string" ? body.transaction_nsu : undefined,
  });

  if (!verified?.paid) {
    // Não é um erro nosso — só não tem nada confirmado ainda (ou o webhook
    // era forjado). 200 pra InfinitePay não ficar retentando à toa.
    return NextResponse.json({ received: true, paid: false });
  }

  const result = await recordProPayment(orderNsu, body?.invoice_slug ?? "");
  if (!result) {
    return NextResponse.json({ received: true, matched: false });
  }

  return NextResponse.json({ received: true, sellerAddress: result.sellerAddress });
}
