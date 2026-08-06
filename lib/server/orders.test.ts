import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  Order as DbOrder,
  OrderItem as DbOrderItem,
  OrderTimelineStep as DbTimelineStep,
  OrderEvidence as DbOrderEvidence,
} from "@prisma/client";

const findFirst = vi.fn();
const orderUpdate = vi.fn();
const orderCount = vi.fn();
const orderCreate = vi.fn();
const timelineStepUpdate = vi.fn();
const transaction = vi.fn((ops: unknown[]) => Promise.all(ops));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findFirst,
      update: orderUpdate,
      count: orderCount,
      create: orderCreate,
    },
    orderTimelineStep: {
      update: timelineStepUpdate,
    },
    $transaction: transaction,
  },
}));

const waitForEscrowState = vi.fn();
const deploySingleReleaseEscrow = vi.fn();
const buildFundEscrow = vi.fn();
const completeMilestoneAsPlatform = vi.fn();

vi.mock("@/lib/server/trustless-work", () => ({
  deploySingleReleaseEscrow,
  buildFundEscrow,
  buildChangeMilestoneStatus: vi.fn(),
  buildApproveMilestone: vi.fn(),
  buildReleaseFunds: vi.fn(),
  buildDisputeEscrow: vi.fn(),
  resolveDisputeAsPlatform: vi.fn(),
  completeMilestoneAsPlatform,
  waitForEscrowState,
}));

const convertBrlToUsdc = vi.fn();
vi.mock("@/lib/server/fx-rate", () => ({ convertBrlToUsdc }));

const createNotification = vi.fn();
vi.mock("@/lib/server/notifications", () => ({ createNotification }));

const resolveFeeForNewEscrow = vi.fn();
const getMaxTxValueForSeller = vi.fn();
vi.mock("@/lib/server/plans", () => ({ resolveFeeForNewEscrow, getMaxTxValueForSeller }));

const {
  confirmPayment,
  markShipped,
  confirmReceipt,
  cancelOrder,
  buildPaymentTransaction,
  createOrder,
} = await import("./orders");

type OrderFixture = DbOrder & {
  items: DbOrderItem[];
  timeline: DbTimelineStep[];
  evidence: DbOrderEvidence[];
};

function makeOrder(overrides: Partial<OrderFixture> = {}): OrderFixture {
  const now = new Date();
  return {
    id: "order-1",
    displayId: "#9700-BR",
    status: "aguardando_pagamento",
    createdAt: now,
    updatedAt: now,
    counterpartyName: "Loja Teste",
    description: "Produto Teste",
    hasShipping: true,
    shippingCost: 0,
    total: 100,
    trackingCode: null,
    disputeReason: null,
    disputeOpenedBy: null,
    sellerResponse: null,
    buyerResponse: null,
    sourceUrl: null,
    sourceMarketplace: null,
    sellerAddress: "GSELLER1234567890123456789012345678901234567890123456",
    buyerAddress: "GBUYER01234567890123456789012345678901234567890123456",
    escrowContractId: "CCONTRACT1234567890123456789012345678901234567890123",
    escrowAmountUsdc: 19.55,
    disputeBuyerAmount: null,
    disputeSellerAmount: null,
    disputeResolvedAt: null,
    escrowDeployedAt: null,
    appliedFeePercent: null,
    items: [],
    evidence: [],
    timeline: [
      { id: "t1", orderId: "order-1", stepId: "pagamento_confirmado", title: "", description: "", timestamp: null, state: "atual", sortOrder: 0 },
      { id: "t2", orderId: "order-1", stepId: "confirmado_vendedor", title: "", description: "", timestamp: null, state: "pendente", sortOrder: 1 },
      { id: "t3", orderId: "order-1", stepId: "em_transito", title: "", description: "", timestamp: null, state: "pendente", sortOrder: 2 },
      { id: "t4", orderId: "order-1", stepId: "entregue", title: "", description: "", timestamp: null, state: "pendente", sortOrder: 3 },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  orderUpdate.mockResolvedValue(undefined);
  timelineStepUpdate.mockResolvedValue(undefined);
  createNotification.mockResolvedValue(undefined);
  completeMilestoneAsPlatform.mockResolvedValue({ status: "SUCCESS", message: "ok", contractId: "C1", escrow: {} });
  resolveFeeForNewEscrow.mockResolvedValue({ feePercent: 5, planSlug: "starter" });
  getMaxTxValueForSeller.mockResolvedValue(null);
});

describe("confirmPayment — verifica o pagamento on-chain antes de gravar", () => {
  it("recusa quando o pedido não tem escrow criado", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ escrowContractId: null, escrowAmountUsdc: null }));
    await expect(confirmPayment("order-1")).rejects.toThrow("ainda não tem um escrow");
  });

  it("é idempotente quando o pedido já não está mais aguardando pagamento", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "pago_custodia" }));
    findFirst.mockResolvedValueOnce(makeOrder({ status: "pago_custodia" }));
    await confirmPayment("order-1");
    expect(waitForEscrowState).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it("recusa quando o financiamento ainda não apareceu on-chain (o exploit original)", async () => {
    findFirst.mockResolvedValueOnce(makeOrder());
    waitForEscrowState.mockResolvedValueOnce(null); // nunca confirmou o saldo
    await expect(confirmPayment("order-1")).rejects.toThrow("Não encontrei o pagamento confirmado");
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it("confirma o pagamento no saldo correto (o valor em USDC travado, não o total em reais)", async () => {
    const order = makeOrder({ total: 100, escrowAmountUsdc: 19.55 });
    findFirst.mockResolvedValueOnce(order);
    waitForEscrowState.mockResolvedValueOnce({ balance: 19.55, flags: { disputed: false, released: false, resolved: false }, milestones: [] });
    findFirst.mockResolvedValueOnce(makeOrder({ status: "pago_custodia" }));

    await confirmPayment("order-1");

    const [, predicate] = waitForEscrowState.mock.calls[0];
    expect(predicate({ balance: 19.55 })).toBe(true);
    expect(predicate({ balance: 19.54 })).toBe(false); // não bastaria pagar o total em reais achando que é USDC
    expect(transaction).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith("order-1", "vendedor", expect.stringContaining("pagou"));
    expect(completeMilestoneAsPlatform).not.toHaveBeenCalled(); // produto físico não pula a etapa de envio
  });

  it("produto digital: completa o milestone como a plataforma e pula direto pra 'entregue'", async () => {
    const digitalTimeline = [
      { id: "t1", orderId: "order-1", stepId: "pagamento_confirmado", title: "", description: "", timestamp: null, state: "atual", sortOrder: 0 },
      { id: "t2", orderId: "order-1", stepId: "confirmado_vendedor", title: "", description: "", timestamp: null, state: "pendente", sortOrder: 1 },
      { id: "t3", orderId: "order-1", stepId: "entregue", title: "", description: "", timestamp: null, state: "pendente", sortOrder: 2 },
    ];
    const order = makeOrder({ hasShipping: false, timeline: digitalTimeline });
    findFirst.mockResolvedValueOnce(order);
    waitForEscrowState.mockResolvedValueOnce({ balance: 19.55, flags: { disputed: false, released: false, resolved: false }, milestones: [] });
    findFirst.mockResolvedValueOnce(makeOrder({ hasShipping: false, status: "pago_custodia" }));

    await confirmPayment("order-1");

    expect(completeMilestoneAsPlatform).toHaveBeenCalledWith(order.escrowContractId, expect.any(String));
    const updateCalls = timelineStepUpdate.mock.calls.map(([arg]) => arg);
    const confirmadoVendedorUpdate = updateCalls.find((c) => c.where.id === "t2");
    const entregueUpdate = updateCalls.find((c) => c.where.id === "t3");
    expect(confirmadoVendedorUpdate?.data.state).toBe("concluido"); // não fica "atual" esperando o vendedor
    expect(entregueUpdate?.data.state).toBe("atual"); // já libera pro comprador confirmar
  });

  it("produto digital: se a Holdfy não conseguir completar o milestone, não grava nada (seguro pra tentar de novo)", async () => {
    const order = makeOrder({ hasShipping: false });
    findFirst.mockResolvedValueOnce(order);
    waitForEscrowState.mockResolvedValueOnce({ balance: 19.55, flags: { disputed: false, released: false, resolved: false }, milestones: [] });
    completeMilestoneAsPlatform.mockRejectedValueOnce(new Error("Trustless Work falhou"));

    await expect(confirmPayment("order-1")).rejects.toThrow("Trustless Work falhou");
    expect(orderUpdate).not.toHaveBeenCalled();
  });
});

describe("markShipped — verifica o milestone on-chain antes de gravar", () => {
  it("recusa quando o milestone ainda não está 'Completed'", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "pago_custodia" }));
    waitForEscrowState.mockResolvedValueOnce(null);
    await expect(markShipped("order-1", "")).rejects.toThrow("Não encontrei o envio confirmado");
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it("é idempotente quando já está em trânsito", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "em_transito" }));
    findFirst.mockResolvedValueOnce(makeOrder({ status: "em_transito" }));
    await markShipped("order-1", "");
    expect(waitForEscrowState).not.toHaveBeenCalled();
  });

  it("recusa marcar como enviado um pedido de produto digital", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "pago_custodia", hasShipping: false }));
    await expect(markShipped("order-1", "")).rejects.toThrow("produto digital");
    expect(waitForEscrowState).not.toHaveBeenCalled();
  });

  it("confirma o envio e notifica o comprador quando o milestone está 'Completed'", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "pago_custodia" }));
    waitForEscrowState.mockResolvedValueOnce({
      balance: 19.55,
      flags: { disputed: false, released: false, resolved: false },
      milestones: [{ status: "Completed", approved: false }],
    });
    findFirst.mockResolvedValueOnce(makeOrder({ status: "em_transito" }));

    await markShipped("order-1", "BR123");

    expect(transaction).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith("order-1", "comprador", expect.stringContaining("enviou"));
  });
});

describe("confirmReceipt — verifica a liberação on-chain antes de gravar", () => {
  it("recusa quando o escrow ainda não mostra 'released'", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "em_transito" }));
    waitForEscrowState.mockResolvedValueOnce(null);
    await expect(confirmReceipt("order-1")).rejects.toThrow("Não encontrei a liberação confirmada");
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it("libera e notifica o vendedor quando o escrow confirma 'released'", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "em_transito" }));
    waitForEscrowState.mockResolvedValueOnce({
      balance: 0,
      flags: { disputed: false, released: true, resolved: false },
      milestones: [{ status: "Completed", approved: true }],
    });
    findFirst.mockResolvedValueOnce(makeOrder({ status: "liberado" }));

    await confirmReceipt("order-1");

    expect(transaction).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith("order-1", "vendedor", expect.stringContaining("liberado"));
  });
});

describe("cancelOrder — só permite cancelar antes do pagamento", () => {
  it("cancela um pedido aguardando pagamento e avisa o outro lado", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "aguardando_pagamento" }));
    findFirst.mockResolvedValueOnce(makeOrder({ status: "cancelado" }));

    await cancelOrder("order-1", "comprador");

    expect(orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "cancelado" } })
    );
    expect(createNotification).toHaveBeenCalledWith("order-1", "vendedor", expect.stringContaining("cancelado"));
  });

  it("recusa cancelar um pedido que já foi pago", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "pago_custodia" }));
    await expect(cancelOrder("order-1", "comprador")).rejects.toThrow("já foi pago");
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it("é idempotente quando já está cancelado", async () => {
    findFirst.mockResolvedValueOnce(makeOrder({ status: "cancelado" }));
    findFirst.mockResolvedValueOnce(makeOrder({ status: "cancelado" }));
    await cancelOrder("order-1", "comprador");
    expect(orderUpdate).not.toHaveBeenCalled();
  });
});

describe("buildPaymentTransaction — usa o valor convertido em USDC, não o total em reais", () => {
  it("converte o total em reais para USDC e usa esse valor no deploy e no financiamento", async () => {
    findFirst.mockResolvedValueOnce(
      makeOrder({ total: 100, escrowContractId: null, escrowAmountUsdc: null })
    );
    convertBrlToUsdc.mockResolvedValueOnce(19.55);
    deploySingleReleaseEscrow.mockResolvedValueOnce({ contractId: "CNEWCONTRACT" });
    buildFundEscrow.mockResolvedValueOnce({ status: "SUCCESS", unsignedTransaction: "xdr" });

    await buildPaymentTransaction("order-1", "GBUYER01234567890123456789012345678901234567890123456");

    expect(convertBrlToUsdc).toHaveBeenCalledWith(100);
    expect(deploySingleReleaseEscrow).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 19.55 })
    );
    expect(buildFundEscrow).toHaveBeenCalledWith("CNEWCONTRACT", expect.any(String), 19.55);
    expect(orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ escrowAmountUsdc: 19.55 }) })
    );
  });

  it("não faz deploy de novo quando o escrow já existe (retentativa idempotente)", async () => {
    findFirst.mockResolvedValueOnce(
      makeOrder({ escrowContractId: "CEXISTING", escrowAmountUsdc: 19.55 })
    );
    buildFundEscrow.mockResolvedValueOnce({ status: "SUCCESS", unsignedTransaction: "xdr" });

    await buildPaymentTransaction("order-1", "GBUYER01234567890123456789012345678901234567890123456");

    expect(convertBrlToUsdc).not.toHaveBeenCalled();
    expect(deploySingleReleaseEscrow).not.toHaveBeenCalled();
    expect(buildFundEscrow).toHaveBeenCalledWith("CEXISTING", expect.any(String), 19.55);
  });

  it("produto digital: deploya o escrow com digitalDelivery para a Trustless Work assumir o milestone", async () => {
    findFirst.mockResolvedValueOnce(
      makeOrder({ hasShipping: false, total: 100, escrowContractId: null, escrowAmountUsdc: null })
    );
    convertBrlToUsdc.mockResolvedValueOnce(19.55);
    deploySingleReleaseEscrow.mockResolvedValueOnce({ contractId: "CNEWCONTRACT" });
    buildFundEscrow.mockResolvedValueOnce({ status: "SUCCESS", unsignedTransaction: "xdr" });

    await buildPaymentTransaction("order-1", "GBUYER01234567890123456789012345678901234567890123456");

    expect(deploySingleReleaseEscrow).toHaveBeenCalledWith(
      expect.objectContaining({ digitalDelivery: true })
    );
  });

  it("usa a taxa resolvida pelo plano do vendedor no deploy e grava appliedFeePercent/escrowDeployedAt", async () => {
    findFirst.mockResolvedValueOnce(
      makeOrder({ escrowContractId: null, escrowAmountUsdc: null })
    );
    convertBrlToUsdc.mockResolvedValueOnce(19.55);
    resolveFeeForNewEscrow.mockResolvedValueOnce({ feePercent: 2.5, planSlug: "pro" });
    deploySingleReleaseEscrow.mockResolvedValueOnce({ contractId: "CNEWCONTRACT" });
    buildFundEscrow.mockResolvedValueOnce({ status: "SUCCESS", unsignedTransaction: "xdr" });

    await buildPaymentTransaction("order-1", "GBUYER01234567890123456789012345678901234567890123456");

    expect(deploySingleReleaseEscrow).toHaveBeenCalledWith(
      expect.objectContaining({ platformFeePercent: 2.5 })
    );
    expect(orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ appliedFeePercent: 2.5, escrowDeployedAt: expect.any(Date) }),
      })
    );
  });
});

describe("createOrder — respeita o limite de valor por pedido do plano do vendedor", () => {
  const newOrderInput = {
    counterpartyName: "Loja Teste",
    itemName: "Produto",
    hasShipping: false,
    shippingCost: 0,
    sellerAddress: "GSELLER1234567890123456789012345678901234567890123456",
  };

  it("recusa um pedido que ultrapassa o limite do plano, sem gravar nada", async () => {
    getMaxTxValueForSeller.mockResolvedValueOnce(5000); // ex: Starter

    await expect(createOrder({ ...newOrderInput, price: 6000 })).rejects.toThrow(
      "ultrapassa o limite"
    );
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("cria normalmente quando o valor está dentro do limite do plano", async () => {
    getMaxTxValueForSeller.mockResolvedValueOnce(20000); // ex: Pro
    orderCount.mockResolvedValueOnce(0);
    orderCreate.mockResolvedValueOnce(makeOrder({ total: 5000 }));

    await createOrder({ ...newOrderInput, price: 5000 });

    expect(orderCreate).toHaveBeenCalled();
  });

  it("sem limite no plano (ex: Enterprise), aceita qualquer valor", async () => {
    getMaxTxValueForSeller.mockResolvedValueOnce(null);
    orderCount.mockResolvedValueOnce(0);
    orderCreate.mockResolvedValueOnce(makeOrder({ total: 999999 }));

    await createOrder({ ...newOrderInput, price: 999999 });

    expect(orderCreate).toHaveBeenCalled();
  });
});
