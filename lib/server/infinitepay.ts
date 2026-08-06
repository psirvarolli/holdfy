import "server-only";

// API real do Checkout Integrado da InfinitePay (confirmada via
// ajuda.infinitepay.io e infinitepay.io/checkout-documentacao — a
// documentação "oficial" em docs.infinitepay.io não resolveu na hora de
// pesquisar, então usamos as páginas que realmente respondem). Diferente da
// Stripe: não usa chave secreta, só o "handle" (@InfiniteTag sem o "$") do
// vendedor — e não existe cobrança recorrente, cada link é um pagamento
// avulso (ver decisão de renovação manual em lib/server/plans.ts).
const BASE_URL = "https://api.checkout.infinitepay.io";
const HANDLE = process.env.INFINITEPAY_HANDLE!;

export class InfinitePayError extends Error {}

export interface CreateLinkItem {
  quantity: number;
  price: number; // em centavos
  description: string;
}

export interface CreateLinkParams {
  orderNsu: string;
  redirectUrl: string;
  webhookUrl: string;
  items: CreateLinkItem[];
}

export async function createPaymentLink(params: CreateLinkParams): Promise<{ url: string }> {
  const res = await fetch(`${BASE_URL}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: HANDLE,
      redirect_url: params.redirectUrl,
      webhook_url: params.webhookUrl,
      order_nsu: params.orderNsu,
      items: params.items,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new InfinitePayError(data?.message ?? "Falha ao gerar o link de pagamento da InfinitePay.");
  }
  return { url: data.url };
}

export interface PaymentCheckResult {
  success: boolean;
  paid: boolean;
  amount: number;
  paidAmount: number;
  installments: number;
  captureMethod: string;
}

// Confere direto na InfinitePay se um pagamento realmente aconteceu — nunca
// confia só no que o webhook diz (o webhook da InfinitePay não tem
// verificação de assinatura documentada, então qualquer um poderia tentar
// forjar uma chamada pra essa rota; só o que a própria InfinitePay confirma
// aqui é confiável). Mesma lógica de "verificar contra a fonte real" já
// usada pros pagamentos on-chain da Trustless Work.
export async function checkPayment(params: {
  orderNsu: string;
  slug?: string;
  transactionNsu?: string;
}): Promise<PaymentCheckResult | null> {
  const res = await fetch(`${BASE_URL}/payment_check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: HANDLE,
      order_nsu: params.orderNsu,
      slug: params.slug,
      transaction_nsu: params.transactionNsu,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data) return null;

  return {
    success: Boolean(data.success),
    paid: Boolean(data.paid),
    amount: data.amount,
    paidAmount: data.paid_amount,
    installments: data.installments,
    captureMethod: data.capture_method,
  };
}
