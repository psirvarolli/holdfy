import { describe, it, expect, vi, beforeEach } from "vitest";

const planFindMany = vi.fn();
const planFindUnique = vi.fn();
const sellerSubscriptionFindUnique = vi.fn();
const sellerSubscriptionUpsert = vi.fn();
const sellerSubscriptionUpdateMany = vi.fn();
const orderCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    plan: { findMany: planFindMany, findUnique: planFindUnique },
    sellerSubscription: {
      findUnique: sellerSubscriptionFindUnique,
      upsert: sellerSubscriptionUpsert,
      updateMany: sellerSubscriptionUpdateMany,
    },
    order: { count: orderCount },
  },
}));

const {
  listPlans,
  resolveFeeForNewEscrow,
  getMaxTxValueForSeller,
  getActivePlanForSeller,
  getSellerPlanStatus,
  encodeProOrderNsu,
  recordProPayment,
  cancelProSubscription,
} = await import("./plans");

const STARTER = {
  id: "plan-starter",
  slug: "starter",
  name: "Starter",
  monthlyPriceReais: 0,
  feePercent: 4.5,
  includedEscrows: null,
  maxTxValueReais: null,
  isNegotiated: false,
};

const PRO = {
  id: "plan-pro",
  slug: "pro",
  name: "Pro",
  monthlyPriceReais: 197,
  feePercent: 2.5,
  includedEscrows: null,
  maxTxValueReais: null,
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

describe("listPlans — ordem de exibição na tela de Planos", () => {
  it("mostra sempre Starter, Pro, Enterprise, mesmo que o banco devolva em outra ordem", async () => {
    // Starter e Enterprise empatam em monthlyPriceReais (R$0) — o banco pode
    // devolver em qualquer ordem entre eles; a exibição não pode depender
    // disso.
    planFindMany.mockResolvedValueOnce([ENTERPRISE, STARTER, PRO]);

    const plans = await listPlans();

    expect(plans.map((p) => p.slug)).toEqual(["starter", "pro", "enterprise"]);
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

  it("vendedor Pro dentro do período pago sempre usa a taxa do Pro, em qualquer volume", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce({
      currentPeriodEnd: inFuture(24),
      plan: PRO,
    });
    const result = await resolveFeeForNewEscrow(SELLER);
    expect(result).toEqual({ feePercent: 2.5, planSlug: "pro" });
    expect(orderCount).not.toHaveBeenCalled(); // Pro não tem mais cota mensal pra contar
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

describe("getMaxTxValueForSeller — nenhum plano limita valor por pedido hoje", () => {
  it("sem sellerAddress, sem limite (não dá pra saber o plano)", async () => {
    expect(await getMaxTxValueForSeller(undefined)).toBeNull();
  });

  it("Starter sem limite", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce(null);
    expect(await getMaxTxValueForSeller(SELLER)).toBeNull();
  });

  it("Pro dentro do período pago sem limite", async () => {
    sellerSubscriptionFindUnique.mockResolvedValueOnce({ currentPeriodEnd: inFuture(24), plan: PRO });
    expect(await getMaxTxValueForSeller(SELLER)).toBeNull();
  });

  it("Enterprise sem limite", async () => {
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

describe("getSellerPlanStatus — o que a tela de Configurações mostra", () => {
  it("status 'active' e sem excedente quando o Pro está dentro do período pago (sem cota mensal)", async () => {
    const periodEnd = inFuture(24);
    // mockResolvedValue (não "Once"): getSellerPlanStatus consulta a
    // assinatura mais de uma vez internamente (inclusive dentro de
    // resolveFeeForNewEscrow, reaproveitada pra achar a taxa realmente
    // cobrada) — é sempre o mesmo registro, então o mock deve valer pra
    // qualquer número de chamadas.
    sellerSubscriptionFindUnique.mockResolvedValue({ currentPeriodEnd: periodEnd, plan: PRO });

    const status = await getSellerPlanStatus(SELLER);
    expect(status.plan.slug).toBe("pro");
    expect(status.status).toBe("active");
    expect(status.escrowsUsedThisMonth).toBeUndefined(); // sem cota — nada pra contar
    expect(status.billedFeePercent).toBeUndefined(); // taxa fixa em qualquer volume
    expect(orderCount).not.toHaveBeenCalled();
  });

  it("status 'expired' quando o último pagamento já venceu", async () => {
    const periodEnd = inPast(1);
    // As chamadas batem no mesmo registro real — vencido em todas; é o
    // check `currentPeriodEnd <= now` dentro de getActiveSubscription que
    // filtra, não uma diferença no que o banco devolve.
    sellerSubscriptionFindUnique.mockResolvedValue({ currentPeriodEnd: periodEnd, plan: PRO });
    const status = await getSellerPlanStatus(SELLER);
    expect(status.status).toBe("expired");
    expect(status.plan.slug).toBe("starter"); // efetivamente já voltou pro Starter
    expect(status.billedFeePercent).toBeUndefined(); // já é Starter — não é "excedente"
  });

  it("status 'none' e sem uso mensal quando nunca assinou nada", async () => {
    sellerSubscriptionFindUnique.mockResolvedValue(null);
    const status = await getSellerPlanStatus(SELLER);
    expect(status.status).toBe("none");
    expect(status.plan.slug).toBe("starter");
    expect(status.escrowsUsedThisMonth).toBeUndefined();
    expect(status.billedFeePercent).toBeUndefined();
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

describe("cancelProSubscription — botão \"Voltar para o Starter\"", () => {
  it("marca o período pago como já vencido, pra cair no Starter na próxima checagem", async () => {
    await cancelProSubscription(SELLER);

    expect(sellerSubscriptionUpdateMany).toHaveBeenCalledOnce();
    const call = sellerSubscriptionUpdateMany.mock.calls[0][0];
    expect(call.where).toEqual({ sellerAddress: SELLER });
    // <= new Date() é o que getActiveSubscription usa pra considerar
    // vencido — não pode ser um instante no futuro por engano.
    expect(call.data.currentPeriodEnd.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("é um no-op seguro pra quem nunca assinou o Pro (updateMany não acha nenhuma linha)", async () => {
    await expect(cancelProSubscription(SELLER)).resolves.toBeUndefined();
  });
});
