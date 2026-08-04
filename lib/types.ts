export type UserRole = "comprador" | "vendedor";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export type OrderStatus =
  | "pago_custodia"
  | "concluido"
  | "em_disputa"
  | "retido"
  | "liberado"
  | "em_transito";

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
  description: string;
  items: OrderItem[];
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
}
