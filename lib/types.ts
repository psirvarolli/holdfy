export type UserRole = "comprador" | "vendedor";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export type OrderStatus =
  | "aguardando_pagamento"
  | "pago_custodia"
  | "concluido"
  | "em_disputa"
  | "retido"
  | "liberado"
  | "em_transito"
  | "cancelado";

export type OrderTimelineStepId =
  | "pagamento_confirmado"
  | "confirmado_vendedor"
  | "em_transito"
  | "entregue";

export type OrderTimelineStepState = "concluido" | "atual" | "pendente";

export interface OrderTimelineStep {
  id: OrderTimelineStepId;
  title: string;
  description: string;
  timestamp: string | null;
  state: OrderTimelineStepState;
}

export interface OrderItem {
  id: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  displayId: string;
  status: OrderStatus;
  createdAt: string;
  counterpartyName: string;
  counterpartyAvatarUrl?: string;
  // Telefone de quem paga, em E.164 (ex: +5511999998888) — usado pelo bot de
  // WhatsApp (repositório separado holdfy-whatsapp) para localizar "meus
  // pedidos" por número. Ver comentário em prisma/schema.prisma.
  buyerPhone?: string;
  description: string;
  items: OrderItem[];
  // Produtos digitais (ex: serviços, arquivos) não têm frete nem etapa de
  // envio física — quando false, shippingCost é sempre 0 e o pedido pula
  // direto de "pago" para o comprador poder confirmar o recebimento.
  hasShipping: boolean;
  shippingCost: number;
  total: number;
  timeline: OrderTimelineStep[];
  trackingCode?: string;
  disputeReason?: string;
  disputeOpenedBy?: UserRole;
  sellerResponse?: string;
  buyerResponse?: string;
  sourceUrl?: string;
  sourceMarketplace?: string;

  // Trustless Work (escrow Soroban na Stellar).
  sellerAddress?: string;
  buyerAddress?: string;
  escrowContractId?: string;
  // Quanto USDC de fato foi (ou precisa ser) depositado no escrow — `total`
  // continua em reais (preço de listagem); este é o valor convertido pela
  // cotação do dia no momento do pagamento.
  escrowAmountUsdc?: number;
  disputeBuyerAmount?: number;
  disputeSellerAmount?: number;
  disputeResolvedAt?: string;
  // Taxa da Holdfy realmente aplicada neste escrow (depende do plano do
  // vendedor no momento do deploy) — undefined até o pedido ser pago.
  appliedFeePercent?: number;
  // Plano usado pra calcular appliedFeePercent — "starter" pode ser um
  // vendedor Starter de verdade, ou um Pro/Enterprise em excedente (ver
  // resolveFeeForNewEscrow em lib/server/plans.ts).
  appliedPlanSlug?: PlanSlug;

  evidence: OrderEvidence[];
}

export type EvidenceStage = "envio" | "recebimento";
export type EvidenceType = "foto" | "video";

export interface OrderEvidence {
  id: string;
  orderId: string;
  stage: EvidenceStage;
  type: EvidenceType;
  url: string;
  uploadedBy: UserRole;
  createdAt: string;
}

export type PlanSlug = "starter" | "pro" | "enterprise";

export interface Plan {
  slug: PlanSlug;
  name: string;
  monthlyPriceReais: number;
  feePercent: number;
  includedEscrows: number | null;
  maxTxValueReais: number | null;
  isNegotiated: boolean;
}

// Situação atual do plano de um vendedor — devolvido por /api/plans/status.
// "active" enquanto currentPeriodEnd está no futuro; "expired" quando já
// passou (o vendedor pagou algum dia, mas não renovou — volta a valer o
// Starter até ele renovar); "none" quando nunca assinou nada.
// `escrowsUsedThisMonth`/`includedEscrows` só fazem sentido pra planos com
// cota mensal (hoje, só o Pro); undefined nos demais.
// `billedFeePercent` só aparece quando difere de `plan.feePercent` — sinal de
// que a cota mensal estourou e novos pedidos estão caindo no excedente
// (cobrado na taxa do Starter) até o mês virar.
export interface SellerPlanStatus {
  plan: Plan;
  status: "active" | "expired" | "none";
  currentPeriodEnd?: string;
  escrowsUsedThisMonth?: number;
  billedFeePercent?: number;
}

export interface Notification {
  id: string;
  orderId: string;
  orderDisplayId: string;
  message: string;
  read: boolean;
  createdAt: string;
}
