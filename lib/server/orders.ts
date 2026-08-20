import { prisma } from "@/lib/prisma";
import { formatTimelineTimestamp } from "@/lib/format";
import {
  deploySingleReleaseEscrow,
  buildFundEscrow,
  buildChangeMilestoneStatus,
  buildApproveMilestone,
  buildReleaseFunds as twBuildReleaseFunds,
  buildDisputeEscrow,
  buildResolveDisputeTransaction as twBuildResolveDisputeTransaction,
  submitSignedTransaction,
  completeMilestoneAsPlatform,
  waitForEscrowState,
} from "@/lib/server/trustless-work";
import { convertBrlToUsdc } from "@/lib/server/fx-rate";
import { createNotification } from "@/lib/server/notifications";
import { resolveFeeForNewEscrow, getMaxTxValueForSeller } from "@/lib/server/plans";
import type {
  Order,
  OrderStatus,
  OrderTimelineStepId,
  OrderTimelineStepState,
  EvidenceStage,
  EvidenceType,
  UserRole,
  PlanSlug,
} from "@/lib/types";
import type {
  Order as DbOrder,
  OrderItem as DbOrderItem,
  OrderTimelineStep as DbTimelineStep,
  OrderEvidence as DbOrderEvidence,
} from "@prisma/client";

export interface NewOrderInput {
  counterpartyName: string;
  itemName: string;
  price: number;
  hasShipping: boolean;
  shippingCost: number;
  sourceUrl?: string;
  sourceMarketplace?: string;
  sellerAddress?: string;
  buyerPhone?: string;
}

type OrderWithRelations = DbOrder & {
  items: DbOrderItem[];
  timeline: DbTimelineStep[];
  evidence: DbOrderEvidence[];
};

const includeRelations = { items: true, timeline: true, evidence: true } as const;

function toApiOrder(order: OrderWithRelations): Order {
  return {
    id: order.id,
    displayId: order.displayId,
    status: order.status as OrderStatus,
    createdAt: order.createdAt.toISOString(),
    counterpartyName: order.counterpartyName,
    buyerPhone: order.buyerPhone ?? undefined,
    description: order.description,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl ?? undefined,
      quantity: item.quantity,
      price: item.price,
    })),
    hasShipping: order.hasShipping,
    shippingCost: order.shippingCost,
    total: order.total,
    timeline: [...order.timeline]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((step) => ({
        id: step.stepId as OrderTimelineStepId,
        title: step.title,
        description: step.description,
        timestamp: step.timestamp,
        state: step.state as OrderTimelineStepState,
      })),
    trackingCode: order.trackingCode ?? undefined,
    disputeReason: order.disputeReason ?? undefined,
    disputeOpenedBy: (order.disputeOpenedBy as UserRole | null) ?? undefined,
    sellerResponse: order.sellerResponse ?? undefined,
    buyerResponse: order.buyerResponse ?? undefined,
    sourceUrl: order.sourceUrl ?? undefined,
    sourceMarketplace: order.sourceMarketplace ?? undefined,
    sellerAddress: order.sellerAddress ?? undefined,
    buyerAddress: order.buyerAddress ?? undefined,
    escrowContractId: order.escrowContractId ?? undefined,
    escrowAmountUsdc: order.escrowAmountUsdc ?? undefined,
    disputeBuyerAmount: order.disputeBuyerAmount ?? undefined,
    disputeSellerAmount: order.disputeSellerAmount ?? undefined,
    disputeResolvedAt: order.disputeResolvedAt?.toISOString(),
    appliedFeePercent: order.appliedFeePercent ?? undefined,
    appliedPlanSlug: (order.appliedPlanSlug as PlanSlug | null) ?? undefined,
    evidence: order.evidence.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      stage: item.stage as EvidenceStage,
      type: item.type as EvidenceType,
      url: item.url,
      uploadedBy: item.uploadedBy as UserRole,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

function findByIdOrDisplayId(id: string) {
  return prisma.order.findFirst({
    where: { OR: [{ id }, { displayId: id }] },
    include: includeRelations,
  });
}

// Usado por lib/server/evidence.ts, que recebe o mesmo `id` de rota (pode ser
// o id interno ou o displayId) e precisa do id interno para gravar no banco.
export async function resolveOrderId(id: string): Promise<string | null> {
  const order = await prisma.order.findFirst({ where: { OR: [{ id }, { displayId: id }] } });
  return order?.id ?? null;
}

export async function listOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    include: includeRelations,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toApiOrder);
}

// Usado por GET /api/orders quando há sessão de carteira verificada (SEP-10)
// — mostra só os pedidos em que o endereço é vendedor ou comprador, em vez
// da listagem inteira da plataforma (ver lib/server/wallet-session.ts).
export async function listOrdersForAddress(address: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { OR: [{ sellerAddress: address }, { buyerAddress: address }] },
    include: includeRelations,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toApiOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  return order ? toApiOrder(order) : null;
}

// Deriva o papel real de quem está chamando a partir do endereço da sessão
// verificada, em vez de confiar num campo "openedBy"/"respondedBy"/
// "cancelledBy" que o próprio cliente informa — antes disso, nada impedia um
// comprador de se declarar "vendedor" nessas rotas. Retorna null se o
// endereço não é nem o comprador nem o vendedor deste pedido específico.
export function resolveOrderRole(order: Order, address: string): UserRole | null {
  if (order.sellerAddress === address) return "vendedor";
  if (order.buyerAddress === address) return "comprador";
  return null;
}

// Usado pelo bot de WhatsApp (repositório separado) para "Meus Pedidos" —
// lista os pedidos em que o número deu como comprador. Não cobre pedidos em
// que a pessoa é vendedora, já que Order não tem um campo sellerPhone hoje.
export async function findOrdersByBuyerPhone(buyerPhone: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { buyerPhone },
    include: includeRelations,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toApiOrder);
}

// Produto físico tem 4 etapas (inclui despacho/rastreio); produto digital
// pula direto de "pago" para "entregue" — não há o que despachar, então a
// etapa "em_transito" nem existe nesse caso (ver decisão registrada na
// memória do projeto: o vendedor não precisa clicar em nada, a Holdfy
// completa o milestone automaticamente em confirmPayment).
function buildInitialTimeline(hasShipping: boolean) {
  if (!hasShipping) {
    return [
      {
        stepId: "pagamento_confirmado",
        title: "Aguardando Pagamento",
        description: "O comprador ainda não pagou este pedido.",
        timestamp: null,
        state: "atual",
        sortOrder: 0,
      },
      {
        stepId: "confirmado_vendedor",
        title: "Produto Liberado",
        description: "Aguardando a confirmação do pagamento para liberar o produto digital.",
        timestamp: null,
        state: "pendente",
        sortOrder: 1,
      },
      {
        stepId: "entregue",
        title: "Entregue",
        description: "Aguardando confirmação de recebimento para liberar o valor ao vendedor.",
        timestamp: null,
        state: "pendente",
        sortOrder: 2,
      },
    ];
  }

  return [
    {
      stepId: "pagamento_confirmado",
      title: "Aguardando Pagamento",
      description: "O comprador ainda não pagou este pedido.",
      timestamp: null,
      state: "atual",
      sortOrder: 0,
    },
    {
      stepId: "confirmado_vendedor",
      title: "Em Processamento",
      description: "Aguardando o vendedor preparar o pedido para envio.",
      timestamp: null,
      state: "pendente",
      sortOrder: 1,
    },
    {
      stepId: "em_transito",
      title: "Em Trânsito",
      description: "Aguardando despacho pelo vendedor.",
      timestamp: null,
      state: "pendente",
      sortOrder: 2,
    },
    {
      stepId: "entregue",
      title: "Entregue",
      description: "Aguardando confirmação de entrega para liberar o valor ao vendedor.",
      timestamp: null,
      state: "pendente",
      sortOrder: 3,
    },
  ];
}

export async function createOrder(input: NewOrderInput): Promise<Order> {
  const shippingCost = input.hasShipping ? input.shippingCost : 0;
  const total = input.price + shippingCost;

  const maxTxValue = await getMaxTxValueForSeller(input.sellerAddress);
  if (maxTxValue !== null && total > maxTxValue) {
    throw new Error(
      `Este pedido (R$ ${total.toFixed(2)}) ultrapassa o limite de valor por pedido do seu plano atual (R$ ${maxTxValue.toFixed(2)}). Assine um plano com limite maior para continuar.`
    );
  }

  const count = await prisma.order.count();
  const n = 9700 + count;
  const now = new Date();

  const created = await prisma.order.create({
    data: {
      displayId: `#${n}-BR`,
      status: "aguardando_pagamento",
      createdAt: now,
      counterpartyName: input.counterpartyName,
      buyerPhone: input.buyerPhone,
      description: input.itemName,
      hasShipping: input.hasShipping,
      shippingCost,
      total,
      sourceUrl: input.sourceUrl,
      sourceMarketplace: input.sourceMarketplace,
      sellerAddress: input.sellerAddress,
      items: {
        create: [{ name: input.itemName, quantity: 1, price: input.price }],
      },
      timeline: {
        create: buildInitialTimeline(input.hasShipping),
      },
    },
    include: includeRelations,
  });

  return toApiOrder(created);
}

// Só é permitido cancelar antes do pagamento — depois disso o dinheiro já
// está em custódia on-chain e a única forma de "desfazer" é pela liberação
// normal ou por uma disputa, não por um cancelamento simples. Um escrow pode
// já ter sido implantado (deploy acontece na primeira tentativa de pagar,
// mesmo que o financiamento falhe) sem problema — sem financiamento, não há
// fundo nenhum retido nele, então não precisa de nenhuma ação on-chain para
// cancelar.
export async function cancelOrder(id: string, cancelledBy: UserRole): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;
  if (order.status === "cancelado") return getOrder(order.id); // idempotente
  if (order.status !== "aguardando_pagamento") {
    throw new Error("Este pedido já foi pago e não pode mais ser cancelado.");
  }

  await prisma.order.update({ where: { id: order.id }, data: { status: "cancelado" } });
  const otherParty = cancelledBy === "comprador" ? "vendedor" : "comprador";
  const otherPartyAddress = otherParty === "vendedor" ? order.sellerAddress : order.buyerAddress;
  await createNotification(order.id, otherParty, otherPartyAddress, `O pedido ${order.displayId} foi cancelado.`);

  return getOrder(order.id);
}

// --- Pagamento (comprador aceita e paga o pedido) ---

// A criação do contrato de escrow é assinada pela própria Holdfy (ver
// lib/server/trustless-work.ts) — só o financiamento (depósito do valor)
// precisa da assinatura do comprador, feita no cliente via Pollar.
export async function buildPaymentTransaction(
  id: string,
  buyerAddress: string
): Promise<{ unsignedTransaction: string }> {
  const order = await findByIdOrDisplayId(id);
  if (!order) throw new Error("Pedido não encontrado.");
  if (order.status !== "aguardando_pagamento") {
    throw new Error("Este pedido não está mais aguardando pagamento.");
  }
  if (!order.sellerAddress) {
    throw new Error("Este pedido não tem a carteira do vendedor registrada.");
  }

  let contractId = order.escrowContractId;
  let usdcAmount = order.escrowAmountUsdc;
  if (!contractId) {
    // `total` é em reais (o vendedor digitou "Valor (R$)") — o escrow em si
    // é em USDC. Converte pela cotação do dia UMA vez, aqui, e trava esse
    // valor no pedido: é o que realmente vai ser depositado on-chain, então
    // não pode mudar entre este deploy e o financiamento logo abaixo.
    usdcAmount = await convertBrlToUsdc(order.total);
    // Taxa depende do plano do vendedor no momento exato do deploy — conta o
    // uso do mês corrente e decide se ainda está dentro da cota do plano ou
    // se cai no excedente (ver lib/server/plans.ts). Fica travada aqui: se o
    // vendedor trocar de plano depois, não afeta escrows já implantados.
    const { feePercent, planSlug } = await resolveFeeForNewEscrow(order.sellerAddress);
    const deployed = await deploySingleReleaseEscrow({
      engagementId: order.displayId,
      title: order.description,
      description: order.description,
      amount: usdcAmount,
      platformFeePercent: feePercent,
      sellerAddress: order.sellerAddress,
      buyerAddress,
      digitalDelivery: !order.hasShipping,
    });
    contractId = deployed.contractId;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        escrowContractId: contractId,
        buyerAddress,
        escrowAmountUsdc: usdcAmount,
        appliedFeePercent: feePercent,
        appliedPlanSlug: planSlug,
        escrowDeployedAt: new Date(),
      },
    });
  }

  return buildFundEscrow(contractId, buyerAddress, usdcAmount!);
}

// Não recebe mais `buyerAddress` do cliente: essa confiança cega era
// justamente o buraco de segurança (dava pra "pagar" um pedido sem nunca ter
// pago, só chamando esta rota direto). Em vez disso, confere o saldo real do
// escrow on-chain antes de gravar qualquer coisa — o endereço do comprador já
// foi salvo em buildPaymentTransaction, no momento do deploy.
export async function confirmPayment(id: string): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;
  if (order.status !== "aguardando_pagamento") return getOrder(order.id); // idempotente
  if (!order.escrowContractId || !order.escrowAmountUsdc) {
    throw new Error("Este pedido ainda não tem um escrow criado.");
  }

  const requiredUsdc = order.escrowAmountUsdc;
  const escrow = await waitForEscrowState(order.escrowContractId, (e) => e.balance >= requiredUsdc);
  if (!escrow) {
    throw new Error(
      "Não encontrei o pagamento confirmado na rede Stellar ainda. Se você acabou de pagar, aguarde alguns segundos e tente de novo."
    );
  }

  // Produto digital não tem etapa de envio — o vendedor não vai clicar em
  // nada, então a própria Holdfy completa o milestone aqui, assinado pela
  // carteira da plataforma (só é válida porque o escrow foi implantado com
  // digitalDelivery: true, ou seja, serviceProvider já é a Holdfy). Se isso
  // falhar, joga o erro antes de gravar qualquer coisa no banco — retentar
  // confirmPayment do zero é seguro, o pagamento em si já está confirmado
  // on-chain independente disso.
  if (!order.hasShipping) {
    await completeMilestoneAsPlatform(
      order.escrowContractId,
      "Produto digital — liberado automaticamente pela Holdfy, sem etapa de envio física."
    );
  }

  const now = formatTimelineTimestamp(new Date());
  const stepUpdates = order.timeline.flatMap((step) => {
    if (step.stepId === "pagamento_confirmado") {
      return [
        prisma.orderTimelineStep.update({
          where: { id: step.id },
          data: {
            state: "concluido",
            description: "O pagamento foi capturado e está retido na Holdfy.",
            timestamp: now,
          },
        }),
      ];
    }
    if (step.stepId === "confirmado_vendedor") {
      return [
        prisma.orderTimelineStep.update({
          where: { id: step.id },
          data: order.hasShipping
            ? { state: "atual" }
            : {
                state: "concluido",
                description: "Produto digital liberado automaticamente para o comprador.",
                timestamp: now,
              },
        }),
      ];
    }
    if (step.stepId === "entregue" && !order.hasShipping) {
      return [prisma.orderTimelineStep.update({ where: { id: step.id }, data: { state: "atual" } })];
    }
    return [];
  });

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: "pago_custodia" } }),
    ...stepUpdates,
  ]);
  await createNotification(order.id, "vendedor", order.sellerAddress, `O comprador pagou o pedido ${order.displayId}.`);

  return getOrder(order.id);
}

// Confirmar recebimento envolve duas transações assinadas pelo comprador:
// aprovar o milestone e, em seguida, liberar os fundos (releaseSigner
// também é o comprador — ver roles em lib/server/trustless-work.ts).
export async function buildApproveReceiptTransaction(id: string): Promise<{ unsignedTransaction: string }> {
  const order = await findByIdOrDisplayId(id);
  if (!order) throw new Error("Pedido não encontrado.");
  if (!order.escrowContractId || !order.buyerAddress) {
    throw new Error("Este pedido ainda não tem um escrow financiado.");
  }
  return buildApproveMilestone(order.escrowContractId, order.buyerAddress);
}

export async function buildReleaseFundsTransaction(id: string): Promise<{ unsignedTransaction: string }> {
  const order = await findByIdOrDisplayId(id);
  if (!order) throw new Error("Pedido não encontrado.");
  if (!order.escrowContractId || !order.buyerAddress) {
    throw new Error("Este pedido ainda não tem um escrow financiado.");
  }
  return twBuildReleaseFunds(order.escrowContractId, order.buyerAddress);
}

export async function confirmReceipt(id: string): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;
  if (order.status === "liberado" || order.status === "concluido") return getOrder(order.id); // idempotente
  if (!order.escrowContractId) {
    throw new Error("Este pedido ainda não tem um escrow criado.");
  }

  const escrow = await waitForEscrowState(order.escrowContractId, (e) => e.flags.released);
  if (!escrow) {
    throw new Error(
      "Não encontrei a liberação confirmada na rede Stellar ainda. Se você acabou de confirmar, aguarde alguns segundos e tente de novo."
    );
  }

  const now = formatTimelineTimestamp(new Date());
  const stepUpdates = order.timeline.flatMap((step) => {
    if (step.stepId === "entregue") {
      return [
        prisma.orderTimelineStep.update({
          where: { id: step.id },
          data: {
            state: "concluido",
            description: "Recebimento confirmado. Valor liberado ao vendedor.",
            timestamp: now,
          },
        }),
      ];
    }
    if (step.state === "atual") {
      return [prisma.orderTimelineStep.update({ where: { id: step.id }, data: { state: "concluido" } })];
    }
    return [];
  });

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: "liberado" } }),
    ...stepUpdates,
  ]);
  await createNotification(
    order.id,
    "vendedor",
    order.sellerAddress,
    `O comprador confirmou o recebimento do pedido ${order.displayId} — o valor foi liberado.`
  );

  return getOrder(order.id);
}

// A mudança de etapa do milestone é assinada pelo vendedor (serviceProvider).
export async function buildShipmentTransaction(
  id: string,
  trackingCode: string
): Promise<{ unsignedTransaction: string }> {
  const order = await findByIdOrDisplayId(id);
  if (!order) throw new Error("Pedido não encontrado.");
  if (!order.hasShipping) {
    throw new Error("Este pedido é de um produto digital e não tem etapa de envio.");
  }
  if (!order.escrowContractId || !order.sellerAddress) {
    throw new Error("Este pedido ainda não tem um escrow financiado.");
  }
  const evidence = trackingCode ? `Rastreio: ${trackingCode}` : "Pedido despachado pelo vendedor.";
  return buildChangeMilestoneStatus(order.escrowContractId, order.sellerAddress, evidence);
}

export async function markShipped(id: string, trackingCode: string): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;
  if (order.status === "em_transito" || order.status === "liberado" || order.status === "concluido") {
    return getOrder(order.id); // idempotente
  }
  if (!order.hasShipping) {
    throw new Error("Este pedido é de um produto digital e não tem etapa de envio.");
  }
  if (!order.escrowContractId) {
    throw new Error("Este pedido ainda não tem um escrow criado.");
  }

  const escrow = await waitForEscrowState(
    order.escrowContractId,
    (e) => e.milestones[0]?.status === "Completed"
  );
  if (!escrow) {
    throw new Error(
      "Não encontrei o envio confirmado na rede Stellar ainda. Se você acabou de marcar como enviado, aguarde alguns segundos e tente de novo."
    );
  }

  const now = formatTimelineTimestamp(new Date());
  const stepUpdates = order.timeline.flatMap((step) => {
    if (step.stepId === "confirmado_vendedor" && step.state === "atual") {
      return [prisma.orderTimelineStep.update({ where: { id: step.id }, data: { state: "concluido" } })];
    }
    if (step.stepId === "em_transito") {
      return [
        prisma.orderTimelineStep.update({
          where: { id: step.id },
          data: {
            state: "atual",
            timestamp: now,
            description: trackingCode
              ? `O pedido foi despachado. Rastreio: ${trackingCode}.`
              : "O pedido foi despachado pelo vendedor.",
          },
        }),
      ];
    }
    return [];
  });

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "em_transito", trackingCode: trackingCode || order.trackingCode },
    }),
    ...stepUpdates,
  ]);
  await createNotification(order.id, "comprador", order.buyerAddress, `O vendedor enviou o pedido ${order.displayId}.`);

  return getOrder(order.id);
}

// Quem abre a disputa (comprador ou vendedor) assina a transação com a
// própria carteira — a Trustless Work exige que o signer seja um dos papéis
// do escrow, então não dá pra abrir disputa "em nome de" alguém.
export async function buildDisputeTransaction(
  id: string,
  openedBy: UserRole
): Promise<{ unsignedTransaction: string }> {
  const order = await findByIdOrDisplayId(id);
  if (!order) throw new Error("Pedido não encontrado.");
  if (!order.escrowContractId) {
    throw new Error("Este pedido ainda não tem um escrow financiado.");
  }
  const signerAddress = openedBy === "comprador" ? order.buyerAddress : order.sellerAddress;
  if (!signerAddress) {
    throw new Error("Carteira do responsável pela disputa não encontrada neste pedido.");
  }
  return buildDisputeEscrow(order.escrowContractId, signerAddress);
}

export async function openDispute(
  id: string,
  reason: string,
  openedBy: UserRole
): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;
  if (order.status === "em_disputa") return getOrder(order.id); // idempotente
  if (!order.escrowContractId) {
    throw new Error("Este pedido ainda não tem um escrow criado.");
  }

  const escrow = await waitForEscrowState(order.escrowContractId, (e) => e.flags.disputed);
  if (!escrow) {
    throw new Error(
      "Não encontrei a disputa confirmada na rede Stellar ainda. Se você acabou de abrir, aguarde alguns segundos e tente de novo."
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "em_disputa",
      disputeReason: reason,
      disputeOpenedBy: openedBy,
      sellerResponse: null,
      buyerResponse: null,
    },
  });
  const otherParty = openedBy === "comprador" ? "vendedor" : "comprador";
  const otherPartyAddress = otherParty === "vendedor" ? order.sellerAddress : order.buyerAddress;
  await createNotification(order.id, otherParty, otherPartyAddress, `Uma disputa foi aberta no pedido ${order.displayId}.`);

  return getOrder(order.id);
}

// Só registra a resposta como texto — a decisão em si (quanto vai para cada
// lado) é tomada pela Holdfy em resolveDisputeAdmin, abaixo.
export async function respondToDispute(
  id: string,
  response: string,
  respondedBy: UserRole
): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;

  await prisma.order.update({
    where: { id: order.id },
    data: respondedBy === "vendedor" ? { sellerResponse: response } : { buyerResponse: response },
  });
  const otherParty = respondedBy === "comprador" ? "vendedor" : "comprador";
  const otherPartyAddress = otherParty === "vendedor" ? order.sellerAddress : order.buyerAddress;
  await createNotification(
    order.id,
    otherParty,
    otherPartyAddress,
    `Uma resposta foi enviada na disputa do pedido ${order.displayId}.`
  );

  return getOrder(order.id);
}

// Resolução de disputa exige 2 assinaturas na conta disputeResolver (a do
// servidor + a pessoal de quem opera o painel admin, via Freighter) — nenhuma
// das duas sozinha move o dinheiro retido. Por isso virou 2 passos: build
// monta a transação e já aplica a assinatura do servidor; submit só entra
// depois que o admin colheu a segunda assinatura no navegador.
//
// buyerAmount + sellerAmount devem somar o valor total retido no escrow (a
// Trustless Work rejeita se não bater) — validado nos dois passos porque o
// valor real que se move é o que foi codificado na transação aqui no build;
// o que o passo de submit recebe de volta serve só para gravar no banco.
function assertValidDisputeSplit(order: NonNullable<Awaited<ReturnType<typeof findByIdOrDisplayId>>>, buyerAmount: number, sellerAmount: number) {
  if (!order.escrowContractId || !order.buyerAddress || !order.sellerAddress || !order.escrowAmountUsdc) {
    throw new Error("Este pedido não tem um escrow completo (faltam carteiras, contrato ou valor).");
  }
  if (Math.abs(buyerAmount + sellerAmount - order.escrowAmountUsdc) > 0.01) {
    throw new Error("A soma dos valores não bate com o total retido no escrow.");
  }
}

export async function buildDisputeResolutionForAdmin(
  id: string,
  buyerAmount: number,
  sellerAmount: number
): Promise<{ partiallySignedTransaction: string } | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;
  assertValidDisputeSplit(order, buyerAmount, sellerAmount);

  const distributions = [
    { address: order.buyerAddress!, amount: buyerAmount },
    { address: order.sellerAddress!, amount: sellerAmount },
  ].filter((d) => d.amount > 0);

  return twBuildResolveDisputeTransaction(order.escrowContractId!, distributions);
}

export async function submitDisputeResolutionForAdmin(
  id: string,
  buyerAmount: number,
  sellerAmount: number,
  signedTransaction: string
): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;
  assertValidDisputeSplit(order, buyerAmount, sellerAmount);

  await submitSignedTransaction(signedTransaction);

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "liberado",
      disputeBuyerAmount: buyerAmount,
      disputeSellerAmount: sellerAmount,
      disputeResolvedAt: new Date(),
    },
  });
  const resolvedMessage = `A disputa do pedido ${order.displayId} foi resolvida pela Holdfy.`;
  await createNotification(order.id, "comprador", order.buyerAddress, resolvedMessage);
  await createNotification(order.id, "vendedor", order.sellerAddress, resolvedMessage);

  return getOrder(order.id);
}
