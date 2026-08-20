import { describe, it, expect, vi, beforeEach } from "vitest";

const planFindMany = vi.fn();
const planFindUnique = vi.fn();
const sellerSubscriptionFindUnique = vi.fn();
const sellerSubscriptionUpsert = vi.fn();
const orderCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    plan: { findMany: planFindMany, findUnique: planFindUnique },
    sellerSubscription: { findUnique: sellerSubscriptionFindUnique, upsert: sellerSubscriptionUpsert },
    order: { count: orderCount },
  },
}));

const {
  resolveFeeForNewEscrow,
  getMaxTxValueForSeller,
  getActivePlanForSeller,
  getSellerPlanStatus,
  encodeProOrderNsu,
  recordProPayment,
} = await import("./plans");

const STARTER = {
  id: "plan-starter",
  slug: "starter",
  name: "Starter",
  monthlyPriceReais: 0,
  feePercent: 4.5,
  includedEscrows: null,
  maxTxValueReais: 5000,
  isNegotiated: false,
};

const PRO = {
  id: "plan-pro",
  slug: "pro",
  name: "Pro",
  monthlyPriceReais: 197,
  feePercent: 2.5,
  includedEscrows: 10,
  maxTxValueReais: 20000,
  isNegotiated: false,
};

const ENTERPRISE = {
  id: "plan-enterprise",
  slug: "enterprise",
  name: "Enterprise",
  monthlyPriceReais: 0,
  feePercent: 1.8,
  includedEscrows: null,
  maxTxValueReais: null,
  isNegotiated: true,
};

const SELLER = "GSELLER1234567890123456789012345678901234567890123456";
const HOUR = 60 * 60 * 1000;

function inFuture(hours: number) {
  return new Date(Date.now() + hours * HOUR);
}

function inPast(hours: number) {
  return new Date(Date.now() - hours * HOUR);
}

beforeEach(() => {
  vi.clearAllMocks();
  planFindUnique.mockImplementation(({ where }: { where: { slug?: string } }) => {
    if (where.slug === "starter") return Promise.resolve(STARTER);
    if (where.slug === "pro") return Promise.resolve(PRO);
    if (where.slug === "enterprise") return Promise.resolve(ENTERPRISE);
    return Promise.resolve(null);
  });
});

describe("resolveFeeForNewEscrow — decide a taxa aplicada a um escrow novo", () => {
  it("sem sellerAddress, usa a taxa do Starter", async () => {
    const result = await resolveFeeForNewEscrow(undefined);
    expect(result).toEqual({ feePercent: 4.5, planSlug: "starter" });
  });

  it("vendedor sem nenhuma assinatura cai no Starter", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce(null);
    const result = await resolveFeeForNewEscrow(SELLER);
    expect(result).toEqual({ feePercent: 4.5, planSlug: "starter" });
    expect(orderCount).not.toHaveBeenCalled(); // Starter não conta uso mensal
  });

  it("vendedor com plano Pro dentro do período pago e da cota mensal usa a taxa do Pro", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce({
      currentPeriodEnd: inFuture(24),
      plan: PRO,
    });
    orderCount.mockResolvedValueOnce(9); // já usou 9 dos 10 incluídos
    const result = await resolveFeeForNewEscrow(SELLER);
    expect(result).toEqual({ feePercent: 2.5, planSlug: "pro" });
  });

  it("vendedor Pro que já passou da cota mensal cai na taxa do Starter (excedente)", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce({
      currentPeriodEnd: inFuture(24),
      plan: PRO,
    });
    orderCount.mockResolvedValueOnce(10);
    const result = await resolveFeeForNewEscrow(SELLER);
    expect(result).toEqual({ feePercent: 4.5, planSlug: "starter" });
  });

  it("vendedor Enterprise nunca conta uso — sempre a taxa negociada", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce({
      currentPeriodEnd: inFuture(24),
      plan: ENTERPRISE,
    });
    const result = await resolveFeeForNewEscrow(SELLER);
    expect(result).toEqual({ feePercent: 1.8, planSlug: "enterprise" });
    expect(orderCount).not.toHaveBeenCalled();
  });

  it("plano Pro com o período pago já vencido não conta — volta pro Starter", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce({
      currentPeriodEnd: inPast(1), // venceu há 1 hora
      plan: PRO,
    });
    const result = await resolveFeeForNewEscrow(SELLER);
    expect(result).toEqual({ feePercent: 4.5, planSlug: "starter" });
  });
});

describe("getMaxTxValueForSeller — limite de valor por pedido do plano", () => {
  it("sem sellerAddress, sem limite (não dá pra saber o plano)", async () => {
    expect(await getMaxTxValueForSeller(undefined)).toBeNull();
  });

  it("Starter limita em R$5.000", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce(null);
    expect(await getMaxTxValueForSeller(SELLER)).toBe(5000);
  });

  it("Pro dentro do período pago limita em R$20.000", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce({ currentPeriodEnd: inFuture(24), plan: PRO });
    expect(await getMaxTxValueForSeller(SELLER)).toBe(20000);
  });

  it("Enterprise não tem limite", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce({ currentPeriodEnd: inFuture(24), plan: ENTERPRISE });
    expect(await getMaxTxValueForSeller(SELLER)).toBeNull();
  });
});

describe("getActivePlanForSeller", () => {
  it("devolve o Starter quando não há assinatura", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce(null);
    const plan = await getActivePlanForSeller(SELLER);
    expect(plan.slug).toBe("starter");
  });

  it("devolve o Starter quando o período pago do Pro já venceu", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce({ currentPeriodEnd: inPast(1), plan: PRO });
    const plan = await getActivePlanForSeller(SELLER);
    expect(plan.slug).toBe("starter");
  });
});

describe("getSellerPlanStatus — o que a tela de Planos mostra", () => {
  it("status 'active' e uso mensal quando o Pro está dentro do período pago", async () => {
    const periodEnd = inFuture(24);
    sellerSubscriptionFindUnique
      .mockResolvedValueOnce({ currentPeriodEnd: periodEnd })
      .mockResolvedValueOnce({ currentPeriodEnd: periodEnd, plan: PRO });
    orderCount.mockResolvedValueOnce(3);

    const status = await getSellerPlanStatus(SELLER);
    expect(status.plan.slug).toBe("pro");
    expect(status.status).toBe("active");
    expect(status.escrowsUsedThisMonth).toBe(3);
  });

  it("status 'expired' quando o último pagamento já venceu", async () => {
    const periodEnd = inPast(1);
    // As duas chamadas batem no mesmo registro real — vencido em ambas; é o
    // check `currentPeriodEnd <= now` dentro de getActiveSubscription que
    // filtra, não uma diferença no que o banco devolve.
    sellerSubscriptionFindUnique.mockResolvedValue({ currentPeriodEnd: periodEnd, plan: PRO });
    const status = await getSellerPlanStatus(SELLER);
    expect(status.status).toBe("expired");
    expect(status.plan.slug).toBe("starter"); // efetivamente já voltou pro Starter
  });

  it("status 'none' e sem uso mensal quando nunca assinou nada", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const status = await getSellerPlanStatus(SELLER);
    expect(status.status).toBe("none");
    expect(status.plan.slug).toBe("starter");
    expect(status.escrowsUsedThisMonth).toBeUndefined();
    expect(orderCount).not.toHaveBeenCalled();
  });
});

describe("encodeProOrderNsu / recordProPayment — confirmação de pagamento do Pro", () => {
  it("recordProPayment ignora um order_nsu que não foi gerado por nós", async () => {
    const result = await recordProPayment("algo-aleatorio-de-fora", "slug-1");
    expect(result).toBeNull();
    expect(sellerSubscriptionUpsert).not.toHaveBeenCalled();
  });

  it("primeira confirmação: cria a assinatura com 30 dias a partir de agora", async () => {
    const orderNsu = encodeProOrderNsu(SELLER);
    sellerSubscriptionFindUnique.mockResolvedValueOnce(null); // nunca assinou antes

    const result = await recordProPayment(orderNsu, "slug-1");

    expect(result).toEqual({ sellerAddress: SELLER });
    expect(sellerSubscriptionUpsert).toHaveBeenCalledOnce();
    const call = sellerSubscriptionUpsert.mock.calls[0][0];
    expect(call.where).toEqual({ sellerAddress: SELLER });
    expect(call.create.planId).toBe(PRO.id);
    const daysAhead = (call.create.currentPeriodEnd.getTime() - Date.now()) / (24 * HOUR);
    expect(daysAhead).toBeGreaterThan(29.9);
    expect(daysAhead).toBeLessThan(30.1);
  });

  it("renovação antecipada soma 30 dias a partir do vencimento atual, não de hoje", async () => {
    const orderNsu = encodeProOrderNsu(SELLER);
    const existingEnd = inFuture(48); // ainda faltam 2 dias pro plano vencer
    sellerSubscriptionFindUnique.mockResolvedValueOnce({ currentPeriodEnd: existingEnd });

    await recordProPayment(orderNsu, "slug-2");

    const call = sellerSubscriptionUpsert.mock.calls[0][0];
    const expected = existingEnd.getTime() + 30 * 24 * HOUR;
    expect(call.update.currentPeriodEnd.getTime()).toBe(expected);
  });

  it("renovação depois de vencido conta 30 dias a partir de agora, não do vencimento antigo", async () => {
    const orderNsu = encodeProOrderNsu(SELLER);
    sellerSubscriptionFindUnique.mockResolvedValueOnce({ currentPeriodEnd: inPast(72) });

    await recordProPayment(orderNsu, "slug-3");

    const call = sellerSubscriptionUpsert.mock.calls[0][0];
    const daysAhead = (call.update.currentPeriodEnd.getTime() - Date.now()) / (24 * HOUR);
    expect(daysAhead).toBeGreaterThan(29.9);
    expect(daysAhead).toBeLessThan(30.1);
  });

  it("reenviar o mesmo order_nsu já creditado não soma dias de novo (replay do webhook)", async () => {
    const orderNsu = encodeProOrderNsu(SELLER);
    sellerSubscriptionFindUnique.mockResolvedValueOnce({
      currentPeriodEnd: inFuture(720), // 30 dias, já creditados por esse mesmo order_nsu
      lastOrderNsu: orderNsu,
    });

    const result = await recordProPayment(orderNsu, "slug-1");

    expect(result).toEqual({ sellerAddress: SELLER });
    expect(sellerSubscriptionUpsert).not.toHaveBeenCalled();
  });

  it("um order_nsu novo do mesmo vendedor soma normalmente (não é o replay que deve ser bloqueado)", async () => {
    const firstOrderNsu = encodeProOrderNsu(SELLER);
    // Sufixo garante um order_nsu diferente mesmo que os dois caiam no mesmo
    // milissegundo — o que importa aqui é só que sejam distintos.
    const secondOrderNsu = `${firstOrderNsu}-2`;
    sellerSubscriptionFindUnique.mockResolvedValueOnce({
      currentPeriodEnd: inFuture(720),
      lastOrderNsu: firstOrderNsu,
    });

    await recordProPayment(secondOrderNsu, "slug-2");

    expect(sellerSubscriptionUpsert).toHaveBeenCalledOnce();
  });
});
