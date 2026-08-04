// Dados mockados para o MVP de frontend da Holdfy.
//
// A lógica de custódia (retenção, liberação e disputa dos fundos) roda on-chain
// em smart contracts Soroban na rede Stellar. Esses contratos são uma camada
// separada, fora do escopo deste repositório — o frontend apenas consome os
// resultados via a Trustless Work (motor de escrow) e a BlindPay (rampa
// PIX <-> stablecoin). Os TODOs abaixo marcam onde essas integrações reais
// vão substituir os dados mockados.

import type { Order } from "@/lib/types";

// TODO: substituir por chamada real à Trustless Work (contrato Soroban na Stellar)
// para ler o estado de custódia de cada pedido (retido / liberado / em disputa).
export const orders: Order[] = [
  {
    id: "ord-9482",
    displayId: "#9482-BR",
    status: "pago_custodia",
    createdAt: "2023-10-14T09:42:00-03:00",
    counterpartyName: "TechStore Brasil",
    description: "Teclado Mecânico Pro V2",
    items: [
      {
        id: "item-9482-1",
        name: "Teclado Mecânico Pro V2",
        quantity: 1,
        price: 450,
      },
    ],
    shippingCost: 45,
    total: 495,
    timeline: [
      {
        id: "pagamento_confirmado",
        title: "Pagamento Confirmado",
        description: "Seu pagamento está seguro na Holdfy.",
        timestamp: "14 Out, 09:42",
        state: "concluido",
      },
      {
        id: "confirmado_vendedor",
        title: "Em Processamento",
        description: "O vendedor está preparando seu pedido.",
        timestamp: "Previsão: 16 Out",
        state: "atual",
      },
      {
        id: "em_transito",
        title: "Em Trânsito",
        description: "Aguardando despacho pelo vendedor.",
        timestamp: null,
        state: "pendente",
      },
      {
        id: "entregue",
        title: "Entregue",
        description:
          "Aguardando confirmação de entrega para liberar o valor ao vendedor.",
        timestamp: null,
        state: "pendente",
      },
    ],
  },
  {
    id: "ord-7392",
    displayId: "#ORD-7392-BR",
    status: "em_transito",
    createdAt: "2023-10-24T14:32:00-03:00",
    counterpartyName: "TechStore Brasil",
    description: "Smartphone Pro Max 256GB e Fones de Ouvido Noise Cancelling",
    items: [
      {
        id: "item-7392-1",
        name: "Smartphone Pro Max 256GB – Prata",
        quantity: 1,
        price: 5499,
      },
      {
        id: "item-7392-2",
        name: "Fones de Ouvido Sem Fio Noise Cancelling",
        quantity: 1,
        price: 899,
      },
    ],
    shippingCost: 45,
    total: 6443,
    timeline: [
      {
        id: "pagamento_confirmado",
        title: "Pagamento Aprovado (Holdfy)",
        description:
          "Os fundos foram capturados e estão seguros com a Holdfy.",
        timestamp: "24 Out, 14:35",
        state: "concluido",
      },
      {
        id: "confirmado_vendedor",
        title: "Pedido Confirmado pelo Vendedor",
        description: "TechStore Brasil confirmou o estoque e iniciou o preparo.",
        timestamp: "25 Out, 09:15",
        state: "concluido",
      },
      {
        id: "em_transito",
        title: "Em Trânsito",
        description:
          "O pedido foi despachado via Transportadora LogLog. Rastreio: BR99382211.",
        timestamp: "26 Out, 16:40",
        state: "atual",
      },
      {
        id: "entregue",
        title: "Entrega Concluída",
        description: "Aguardando confirmação de recebimento pelo comprador.",
        timestamp: null,
        state: "pendente",
      },
    ],
  },
  {
    id: "ord-4829",
    displayId: "#4829",
    status: "retido",
    createdAt: "2023-10-15T10:00:00-03:00",
    counterpartyName: "TechStore Brasil",
    description: "Pedido #4829",
    items: [{ id: "item-4829-1", name: "Pedido #4829", quantity: 1, price: 3500 }],
    shippingCost: 0,
    total: 3500,
    timeline: [],
  },
  {
    id: "ord-4812",
    displayId: "#4812",
    status: "liberado",
    createdAt: "2023-10-10T10:00:00-03:00",
    counterpartyName: "Boutique Elegance",
    description: "Pedido #4812",
    items: [{ id: "item-4812-1", name: "Pedido #4812", quantity: 1, price: 450 }],
    shippingCost: 0,
    total: 450,
    timeline: [],
  },
  {
    id: "ord-4799",
    displayId: "#4799",
    status: "em_disputa",
    createdAt: "2023-10-02T10:00:00-03:00",
    counterpartyName: "Móveis & Cia",
    description: "Pedido #4799",
    items: [{ id: "item-4799-1", name: "Pedido #4799", quantity: 1, price: 1200 }],
    shippingCost: 0,
    total: 1200,
    timeline: [],
  },
  {
    id: "ord-9821",
    displayId: "#9821",
    status: "retido",
    createdAt: "2023-10-12T10:00:00-03:00",
    counterpartyName: "TechStore BR",
    description: "MacBook Pro M3",
    items: [{ id: "item-9821-1", name: "MacBook Pro M3", quantity: 1, price: 14500 }],
    shippingCost: 0,
    total: 14500,
    timeline: [],
  },
  {
    id: "ord-9810",
    displayId: "#9810",
    status: "em_disputa",
    createdAt: "2023-10-05T10:00:00-03:00",
    counterpartyName: "Office Premium",
    description: "Cadeira Ergonômica Herman Miller",
    items: [
      {
        id: "item-9810-1",
        name: "Cadeira Ergonômica Herman Miller",
        quantity: 1,
        price: 8200,
      },
    ],
    shippingCost: 0,
    total: 8200,
    timeline: [],
  },
  {
    id: "ord-9755",
    displayId: "#9755",
    status: "liberado",
    createdAt: "2023-09-28T10:00:00-03:00",
    counterpartyName: "AudioCenter",
    description: "Sony WH-1000XM5",
    items: [{ id: "item-9755-1", name: "Sony WH-1000XM5", quantity: 1, price: 2100 }],
    shippingCost: 0,
    total: 2100,
    timeline: [],
  },
  {
    id: "ord-0992",
    displayId: "#ORD-0992",
    status: "pago_custodia",
    createdAt: "2023-10-15T10:00:00-03:00",
    counterpartyName: "TechCorp Brasil",
    description: "Consultoria Tech",
    items: [{ id: "item-0992-1", name: "Consultoria Tech", quantity: 1, price: 12500 }],
    shippingCost: 0,
    total: 12500,
    timeline: [],
  },
  {
    id: "ord-0985",
    displayId: "#ORD-0985",
    status: "concluido",
    createdAt: "2023-10-10T10:00:00-03:00",
    counterpartyName: "StartupX",
    description: "Design System",
    items: [{ id: "item-0985-1", name: "Design System", quantity: 1, price: 8200 }],
    shippingCost: 0,
    total: 8200,
    timeline: [],
  },
  {
    id: "ord-0971",
    displayId: "#ORD-0971",
    status: "em_disputa",
    createdAt: "2023-10-05T10:00:00-03:00",
    counterpartyName: "Agência Y",
    description: "Campanha Ads",
    items: [{ id: "item-0971-1", name: "Campanha Ads", quantity: 1, price: 4500 }],
    shippingCost: 0,
    total: 4500,
    timeline: [],
  },
  {
    id: "ord-0955",
    displayId: "#ORD-0955",
    status: "concluido",
    createdAt: "2023-09-28T10:00:00-03:00",
    counterpartyName: "Padaria Central",
    description: "Site Institucional",
    items: [{ id: "item-0955-1", name: "Site Institucional", quantity: 1, price: 3000 }],
    shippingCost: 0,
    total: 3000,
    timeline: [],
  },
  {
    id: "ord-99382",
    displayId: "#ORD-99382-A",
    status: "pago_custodia",
    createdAt: "2023-10-12T10:00:00-03:00",
    counterpartyName: "Mariana Costa",
    description: "Website Redesign UI/UX",
    items: [
      { id: "item-99382-1", name: "Website Redesign UI/UX", quantity: 1, price: 4500 },
    ],
    shippingCost: 0,
    total: 4500,
    timeline: [],
  },
  {
    id: "ord-88214",
    displayId: "#ORD-88214-B",
    status: "concluido",
    createdAt: "2023-09-28T10:00:00-03:00",
    counterpartyName: "Lucas Almeida",
    description: "Custom API Integration",
    items: [
      { id: "item-88214-1", name: "Custom API Integration", quantity: 1, price: 2800 },
    ],
    shippingCost: 0,
    total: 2800,
    timeline: [],
  },
  {
    id: "ord-99105",
    displayId: "#ORD-99105-X",
    status: "em_disputa",
    createdAt: "2023-10-14T10:00:00-03:00",
    counterpartyName: "Tech Corp SA",
    description: "Server Migration Services",
    items: [
      { id: "item-99105-1", name: "Server Migration Services", quantity: 1, price: 12000 },
    ],
    shippingCost: 0,
    total: 12000,
    timeline: [],
  },
  {
    id: "ord-99411",
    displayId: "#ORD-99411-C",
    status: "pago_custodia",
    createdAt: "2023-10-18T10:00:00-03:00",
    counterpartyName: "Camila Rocha",
    description: "Social Media Campaign",
    items: [
      { id: "item-99411-1", name: "Social Media Campaign", quantity: 1, price: 1500 },
    ],
    shippingCost: 0,
    total: 1500,
    timeline: [],
  },
];

// Os helpers abaixo recebem a lista de pedidos como argumento (em vez de usar
// `orders` diretamente) para poderem operar tanto sobre os dados semente
// quanto sobre o estado vivo mantido por lib/orders-context.tsx.
export function getOrderById(list: Order[], id: string): Order | undefined {
  return list.find((order) => order.id === id || order.displayId === id);
}

export function getOrdersByStatus(list: Order[], status?: Order["status"]): Order[] {
  if (!status) return list;
  return list.filter((order) => order.status === status);
}

// TODO: substituir por leitura real de saldo em custódia via Trustless Work.
export function getBuyerMetrics(list: Order[]) {
  const held = list.filter((o) => o.status === "pago_custodia" || o.status === "retido");
  const completed = list.filter((o) => o.status === "concluido" || o.status === "liberado");
  const awaitingRelease = list.filter(
    (o) => o.status === "pago_custodia" || o.status === "em_transito"
  );

  return {
    totalHeld: held.reduce((sum, o) => sum + o.total, 0),
    completedCount: completed.length,
    awaitingReleaseCount: awaitingRelease.length,
  };
}

export function getSellerMetrics(list: Order[]) {
  const inEscrow = list.filter((o) => o.status === "pago_custodia" || o.status === "em_transito");
  const disputed = list.filter((o) => o.status === "em_disputa");
  const completed = list.filter((o) => o.status === "concluido" || o.status === "liberado");

  return {
    protectedSalesCount: list.length,
    inEscrowTotal: inEscrow.reduce((sum, o) => sum + o.total, 0),
    completedTotal: completed.reduce((sum, o) => sum + o.total, 0),
    disputedCount: disputed.length,
  };
}
