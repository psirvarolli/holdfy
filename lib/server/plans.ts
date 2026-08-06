import "server-only";
import { prisma } from "@/lib/prisma";
import type { Plan, PlanSlug, SellerPlanStatus } from "@/lib/types";
import type { Plan as DbPlan } from "@prisma/client";

function toApiPlan(plan: DbPlan): Plan {
  return {
    slug: plan.slug as PlanSlug,
    name: plan.name,
    monthlyPriceReais: plan.monthlyPriceReais,
    feePercent: plan.feePercent,
    includedEscrows: plan.includedEscrows,
    maxTxValueReais: plan.maxTxValueReais,
    isNegotiated: plan.isNegotiated,
  };
}

export async function listPlans(): Promise<Plan[]> {
  const plans = await prisma.plan.findMany({ orderBy: { monthlyPriceReais: "asc" } });
  return plans.map(toApiPlan);
}

export async function getPlanBySlug(slug: PlanSlug) {
  return prisma.plan.findUnique({ where: { slug } });
}

// Starter é o plano implícito: todo vendedor sem assinatura ativa cai nele,
// sem precisar de nenhuma linha em SellerSubscription — só quem paga por um
// plano melhor (Pro) ou negocia diretamente (Enterprise) tem um registro ali.
async function getStarterPlan() {
  const plan = await prisma.plan.findUnique({ where: { slug: "starter" } });
  if (!plan) throw new Error("Plano Starter não encontrado — rode o seed do banco.");
  return plan;
}

// "Ativo" é sempre currentPeriodEnd no futuro — nunca um campo de status
// separado (a InfinitePay não avisa quando uma assinatura "acaba", já que
// não existe assinatura de verdade do lado dela; só sabemos até quando o
// último pagamento cobre).
async function getActiveSubscription(sellerAddress: string) {
  const subscription = await prisma.sellerSubscription.findUnique({
    where: { sellerAddress },
    include: { plan: true },
  });
  if (!subscription || subscription.currentPeriodEnd <= new Date()) return null;
  return subscription;
}

const PRO_PAYMENT_PERIOD_DAYS = 30;

// O order_nsu é o identificador que A HOLDFY escolhe ao gerar o link de
// pagamento (a InfinitePay só ecoa de volta) — carimbamos o sellerAddress
// nele pra conseguir religar um webhook/pagamento confirmado ao vendedor
// certo sem precisar de uma tabela de "pagamentos pendentes" à parte.
// Endereços Stellar usam alfabeto base32 (A-Z2-7), sem ":", então é um
// delimitador seguro.
export function encodeProOrderNsu(sellerAddress: string): string {
  return `pro:${sellerAddress}:${Date.now()}`;
}

function decodeProOrderNsu(orderNsu: string): { sellerAddress: string } | null {
  const [kind, sellerAddress] = orderNsu.split(":");
  if (kind !== "pro" || !sellerAddress) return null;
  return { sellerAddress };
}

// Confirma um pagamento do plano Pro e estende o período de acesso — chamado
// só depois que o webhook é validado contra a própria InfinitePay via
// checkPayment (nunca a partir do payload do webhook sozinho, ver
// app/api/infinitepay/webhook/route.ts). Renovar antes de vencer soma a
// partir do vencimento atual, não a partir de hoje, pra não perder dias já
// pagos; renovar depois de vencido conta a partir de agora.
export async function recordProPayment(
  orderNsu: string,
  invoiceSlug: string
): Promise<{ sellerAddress: string } | null> {
  const decoded = decodeProOrderNsu(orderNsu);
  if (!decoded) return null;

  const pro = await getPlanBySlug("pro");
  if (!pro) throw new Error("Plano Pro não encontrado — rode o seed do banco.");

  const existing = await prisma.sellerSubscription.findUnique({
    where: { sellerAddress: decoded.sellerAddress },
  });
  const base = existing && existing.currentPeriodEnd > new Date() ? existing.currentPeriodEnd : new Date();
  const currentPeriodEnd = new Date(base.getTime() + PRO_PAYMENT_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  await prisma.sellerSubscription.upsert({
    where: { sellerAddress: decoded.sellerAddress },
    create: {
      sellerAddress: decoded.sellerAddress,
      planId: pro.id,
      currentPeriodEnd,
      lastInvoiceSlug: invoiceSlug,
      lastOrderNsu: orderNsu,
    },
    update: {
      planId: pro.id,
      currentPeriodEnd,
      lastInvoiceSlug: invoiceSlug,
      lastOrderNsu: orderNsu,
    },
  });

  return decoded;
}

export async function getActivePlanForSeller(sellerAddress: string): Promise<DbPlan> {
  const subscription = await getActiveSubscription(sellerAddress);
  return subscription?.plan ?? (await getStarterPlan());
}

// Quantos escrows esse vendedor já implantou no mês corrente — usado só pra
// planos com cota mensal (hoje, o Pro). Conta qualquer deploy, mesmo que o
// pedido tenha sido cancelado depois: o custo real pra Holdfy (criar o
// contrato) já aconteceu de qualquer forma.
export async function countEscrowsThisMonth(sellerAddress: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return prisma.order.count({
    where: { sellerAddress, escrowDeployedAt: { gte: startOfMonth } },
  });
}

// Decide a taxa a aplicar num escrow que está sendo implantado agora, ANTES
// do deploy (chamado de dentro de buildPaymentTransaction) — por isso conta
// o uso já existente, sem incluir o escrow atual (que ainda não foi criado).
export async function resolveFeeForNewEscrow(
  sellerAddress: string | null | undefined
): Promise<{ feePercent: number; planSlug: PlanSlug }> {
  if (!sellerAddress) {
    const starter = await getStarterPlan();
    return { feePercent: starter.feePercent, planSlug: starter.slug as PlanSlug };
  }

  const plan = await getActivePlanForSeller(sellerAddress);

  if (plan.includedEscrows == null) {
    // Starter (sempre pay-as-you-go) ou Enterprise (ilimitado) — sem contagem.
    return { feePercent: plan.feePercent, planSlug: plan.slug as PlanSlug };
  }

  const usedThisMonth = await countEscrowsThisMonth(sellerAddress);
  if (usedThisMonth < plan.includedEscrows) {
    return { feePercent: plan.feePercent, planSlug: plan.slug as PlanSlug };
  }

  // Passou da cota mensal do plano — excedente cobrado na taxa do Starter.
  const starter = await getStarterPlan();
  return { feePercent: starter.feePercent, planSlug: starter.slug as PlanSlug };
}

// Limite de valor por pedido do plano ativo — null quando o plano não impõe
// limite (Enterprise, ou vendedor ainda sem carteira/plano identificado).
export async function getMaxTxValueForSeller(
  sellerAddress: string | null | undefined
): Promise<number | null> {
  if (!sellerAddress) return null;
  const plan = await getActivePlanForSeller(sellerAddress);
  return plan.maxTxValueReais;
}

export async function getSellerPlanStatus(sellerAddress: string): Promise<SellerPlanStatus> {
  const subscription = await prisma.sellerSubscription.findUnique({ where: { sellerAddress } });
  // Reaproveita a mesma regra de "o que vale de verdade" usada no cálculo da
  // taxa — evita as duas lógicas divergirem sobre o que conta como ativo.
  const plan = await getActivePlanForSeller(sellerAddress);

  let status: SellerPlanStatus["status"] = "none";
  if (subscription) {
    status = subscription.currentPeriodEnd > new Date() ? "active" : "expired";
  }

  const result: SellerPlanStatus = {
    plan: toApiPlan(plan),
    status,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString(),
  };

  if (plan.includedEscrows != null) {
    result.escrowsUsedThisMonth = await countEscrowsThisMonth(sellerAddress);
  }

  return result;
}
