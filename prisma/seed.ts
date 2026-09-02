import { PrismaClient } from "@prisma/client";
import { orders as mockOrders } from "../lib/mocks/orders";

const prisma = new PrismaClient();

// Planos de cobrança — cadastrados aqui, não editáveis pelo app (ver
// lib/server/plans.ts). O preço do Pro é só um número (R$197) usado pra
// montar o link de pagamento da InfinitePay na hora — diferente da Stripe,
// não existe um "Price" cadastrado antecipadamente do lado de fora.
const PLAN_SEEDS = [
  {
    slug: "starter",
    name: "Starter",
    monthlyPriceReais: 0,
    feePercent: 4.5,
    includedEscrows: null,
    maxTxValueReais: null,
    isNegotiated: false,
  },
  {
    slug: "pro",
    name: "Pro",
    monthlyPriceReais: 197,
    feePercent: 2.5,
    includedEscrows: null,
    maxTxValueReais: null,
    isNegotiated: false,
  },
] as const;

async function main() {
  console.log("Cadastrando planos...");
  for (const plan of PLAN_SEEDS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      create: plan,
      update: plan,
    });
  }

  console.log("Limpando dados existentes...");
  await prisma.orderTimelineStep.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();

  console.log("Criando usuários de demonstração...");
  // TODO: quando a Pollar entrar, usuários reais substituem estes registros fixos.
  await prisma.user.createMany({
    data: [
      { name: "Alex Silva", email: "alex@holdfy.com", role: "comprador" },
      { name: "Alex Silva (Loja)", email: "alex.loja@holdfy.com", role: "vendedor" },
    ],
  });

  console.log(`Criando ${mockOrders.length} pedidos...`);
  for (const order of mockOrders) {
    await prisma.order.create({
      data: {
        id: order.id,
        displayId: order.displayId,
        status: order.status,
        createdAt: new Date(order.createdAt),
        counterpartyName: order.counterpartyName,
        description: order.description,
        shippingCost: order.shippingCost,
        total: order.total,
        trackingCode: order.trackingCode,
        disputeReason: order.disputeReason,
        disputeOpenedBy: order.disputeOpenedBy,
        sellerResponse: order.sellerResponse,
        buyerResponse: order.buyerResponse,
        sourceUrl: order.sourceUrl,
        sourceMarketplace: order.sourceMarketplace,
        items: {
          create: order.items.map((item) => ({
            name: item.name,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        timeline: {
          create: order.timeline.map((step, index) => ({
            stepId: step.id,
            title: step.title,
            description: step.description,
            timestamp: step.timestamp,
            state: step.state,
            sortOrder: index,
          })),
        },
      },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
