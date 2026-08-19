import { NextResponse } from "next/server";
import { z } from "zod";
import { listOrdersForAddress, createOrder, findOrdersByBuyerPhone } from "@/lib/server/orders";
import { parseJsonBody, stellarAddress, money, e164Phone } from "@/lib/server/validation";
import { getSessionAddress } from "@/lib/server/wallet-session";
import { isTrustedBotRequest } from "@/lib/server/bot-auth";

export async function GET(request: Request) {
  // Usado pelo bot de WhatsApp (repositório separado, sem sessão de
  // navegador) para achar os pedidos de um comprador pelo telefone — trust
  // model próprio, já discutido na auditoria, mantido como está por ora.
  const phone = new URL(request.url).searchParams.get("buyerPhone");
  if (phone) {
    const parsed = e164Phone.safeParse(phone);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Telefone inválido." }, { status: 400 });
    }
    const orders = await findOrdersByBuyerPhone(parsed.data);
    return NextResponse.json({ orders });
  }

  // Chamada pelo painel web (lib/orders-context.tsx) — exige sessão de
  // carteira verificada por SEP-10 (ver lib/server/wallet-session.ts) e
  // devolve só os pedidos em que o endereço é vendedor ou comprador, nunca
  // a listagem inteira da plataforma.
  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const orders = await listOrdersForAddress(address);
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
  // Só é usado (e exigido) na chamada de servidor-para-servidor do bot de
  // WhatsApp, autenticada por isTrustedBotRequest — ver o ramo abaixo.
  // Numa chamada do navegador, este campo é ignorado: o endereço vem sempre
  // da sessão verificada por SEP-10.
  sellerAddress: stellarAddress.optional(),
  buyerPhone: e164Phone.optional(),
});

export async function POST(request: Request) {
  const isBotRequest = isTrustedBotRequest(request);
  const sessionAddress = isBotRequest ? null : await getSessionAddress(request);

  if (!isBotRequest && !sessionAddress) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, newOrderSchema);
  if ("error" in parsed) return parsed.error;

  let sellerAddress: string;
  if (isBotRequest) {
    if (!parsed.data.sellerAddress) {
      return NextResponse.json({ error: "sellerAddress é obrigatório nesta chamada." }, { status: 400 });
    }
    sellerAddress = parsed.data.sellerAddress;
  } else {
    // Vem sempre da sessão verificada, nunca do corpo da requisição — é
    // exatamente essa a falha que motivou esta mudança (ver auditoria de
    // mainnet).
    sellerAddress = sessionAddress!;
  }

  const order = await createOrder({ ...parsed.data, sellerAddress });
  return NextResponse.json({ order }, { status: 201 });
}
