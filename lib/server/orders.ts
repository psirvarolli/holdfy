import { prisma } from "@/lib/prisma";
import { formatTimelineTimestamp } from "@/lib/format";
import type {
  Order,
  OrderStatus,
  OrderTimelineStepId,
  OrderTimelineStepState,
  UserRole,
} from "@/lib/types";
import type {
  Order as DbOrder,
  OrderItem as DbOrderItem,
  OrderTimelineStep as DbTimelineStep,
} from "@prisma/client";

export interface NewOrderInput {
  counterpartyName: string;
  itemName: string;
  price: number;
  shippingCost: number;
  sourceUrl?: string;
  sourceMarketplace?: string;
}

type OrderWithRelations = DbOrder & { items: DbOrderItem[]; timeline: DbTimelineStep[] };

const includeRelations = { items: true, timeline: true } as const;

function toApiOrder(order: OrderWithRelations): Order {
  return {
    id: order.id,
    displayId: order.displayId,
    status: order.status as OrderStatus,
    createdAt: order.createdAt.toISOString(),
    counterpartyName: order.counterpartyName,
    description: order.description,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl ?? undefined,
      quantity: item.quantity,
      price: item.price,
    })),
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
  };
}

function findByIdOrDisplayId(id: string) {
  return prisma.order.findFirst({
    where: { OR: [{ id }, { displayId: id }] },
    include: includeRelations,
  });
}

export async function listOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    include: includeRelations,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toApiOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  return order ? toApiOrder(order) : null;
}

// TODO: chamar Trustless Work para criar o contrato de escrow (Soroban/Stellar)
// e a BlindPay para gerar o link de cobrança PIX correspondente.
export async function createOrder(input: NewOrderInput): Promise<Order> {
  const count = await prisma.order.count();
  const n = 9700 + count;
  const now = new Date();

  const created = await prisma.order.create({
    data: {
      displayId: `#${n}-BR`,
      status: "pago_custodia",
      createdAt: now,
      counterpartyName: input.counterpartyName,
      description: input.itemName,
      shippingCost: input.shippingCost,
      total: input.price + input.shippingCost,
      sourceUrl: input.sourceUrl,
      sourceMarketplace: input.sourceMarketplace,
      items: {
        create: [{ name: input.itemName, quantity: 1, price: input.price }],
      },
      timeline: {
        create: [
          {
            stepId: "pagamento_confirmado",
            title: "Pagamento Confirmado",
            description: "O pagamento foi capturado e está retido na Holdfy.",
            timestamp: formatTimelineTimestamp(now),
            state: "concluido",
            sortOrder: 0,
          },
          {
            stepId: "confirmado_vendedor",
            title: "Em Processamento",
            description: "Aguardando o vendedor preparar o pedido para envio.",
            timestamp: null,
            state: "atual",
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
            description:
              "Aguardando confirmação de entrega para liberar o valor ao vendedor.",
            timestamp: null,
            state: "pendente",
            sortOrder: 3,
          },
        ],
      },
    },
    include: includeRelations,
  });

  return toApiOrder(created);
}

// TODO: chamar Trustless Work para liberar os fundos do contrato de escrow (Soroban/Stellar).
export async function confirmReceipt(id: string): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;

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

  return getOrder(order.id);
}

// TODO: notificar a Trustless Work da mudança de etapa do contrato de escrow.
export async function markShipped(id: string, trackingCode: string): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;

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

  return getOrder(order.id);
}

// TODO: chamar Trustless Work para abrir disputa no contrato de escrow (Soroban/Stellar).
export async function openDispute(
  id: string,
  reason: string,
  openedBy: UserRole
): Promise<Order | null> {
  const order = await findByIdOrDisplayId(id);
  if (!order) return null;

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

  return getOrder(order.id);
}

// TODO: enviar evidências para a Trustless Work mediar a disputa no contrato de escrow.
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

  return getOrder(order.id);
}
