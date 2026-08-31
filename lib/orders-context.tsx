"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePollar } from "@pollar/react";
import type { EvidenceStage, EvidenceType, Order, OrderStatus, UserRole } from "@/lib/types";
import { buildSignAndSubmit } from "@/lib/escrow-client";
import { uploadEvidence } from "@/lib/evidence-client";

export interface NewOrderInput {
  counterpartyName: string;
  itemName: string;
  price: number;
  hasShipping: boolean;
  shippingCost: number;
  sourceUrl?: string;
  sourceMarketplace?: string;
}

interface OrdersContextValue {
  orders: Order[];
  isLoading: boolean;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status?: OrderStatus) => Order[];
  createOrder: (input: NewOrderInput) => Promise<Order>;
  payOrder: (id: string) => Promise<void>;
  confirmReceipt: (id: string) => Promise<void>;
  openDispute: (id: string, reason: string) => Promise<void>;
  markShipped: (id: string, trackingCode: string) => Promise<void>;
  respondToDispute: (id: string, response: string) => Promise<void>;
  // Exposto para o painel admin de disputas, que assina fora do fluxo Pollar
  // (via Freighter, ver components/shared/dispute-resolution-panel.tsx) e
  // por isso não passa pelas ações acima — só precisa gravar o resultado
  // final no estado compartilhado.
  upsertOrder: (order: Order) => void;
  cancelOrder: (id: string) => Promise<void>;
  addEvidence: (
    id: string,
    file: File,
    stage: EvidenceStage,
    type: EvidenceType,
    uploadedBy: UserRole
  ) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Falha na requisição para ${url} (${res.status}).`);
  }
  return res.json();
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { wallet, signAndSubmitTx } = usePollar();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data: { orders: Order[] }) => {
        if (!cancelled) setOrders(data.orders ?? []);
      })
      .catch(() => {
        // TODO: exibir um estado de erro em vez de silenciar a falha.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function upsertOrder(updated: Order) {
    setOrders((prev) => {
      const exists = prev.some((order) => order.id === updated.id);
      return exists ? prev.map((order) => (order.id === updated.id ? updated : order)) : [updated, ...prev];
    });
  }

  async function createOrder(input: NewOrderInput): Promise<Order> {
    // sellerAddress não vai mais no corpo — o servidor deriva da sessão de
    // carteira verificada por SEP-10 (ver lib/wallet-session-client.ts).
    const { order } = await postJson<{ order: Order }>("/api/orders", input);
    upsertOrder(order);
    return order;
  }

  // O papel de quem chama (openedBy/respondedBy/cancelledBy) não é mais
  // passado nem lido aqui — o servidor deriva o papel de verdade comparando
  // a sessão de carteira com sellerAddress/buyerAddress do próprio pedido
  // (ver resolveOrderRole em lib/server/orders.ts).

  async function payOrder(id: string) {
    if (!wallet) throw new Error("Sua carteira ainda não está pronta. Aguarde um instante e tente de novo.");
    await buildSignAndSubmit(`/api/orders/${id}/pay/build`, {}, signAndSubmitTx);
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/pay/confirm`);
    upsertOrder(order);
  }

  async function confirmReceipt(id: string) {
    await buildSignAndSubmit(`/api/orders/${id}/confirm-receipt/build-approve`, {}, signAndSubmitTx);
    await buildSignAndSubmit(`/api/orders/${id}/confirm-receipt/build-release`, {}, signAndSubmitTx);
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/confirm-receipt`);
    upsertOrder(order);
  }

  async function openDispute(id: string, reason: string) {
    await buildSignAndSubmit(`/api/orders/${id}/dispute/build`, {}, signAndSubmitTx);
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/dispute`, { reason });
    upsertOrder(order);
  }

  async function markShipped(id: string, trackingCode: string) {
    await buildSignAndSubmit(`/api/orders/${id}/ship/build`, { trackingCode }, signAndSubmitTx);
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/ship`, { trackingCode });
    upsertOrder(order);
  }

  async function respondToDispute(id: string, response: string) {
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/dispute/respond`, { response });
    upsertOrder(order);
  }

  async function cancelOrder(id: string) {
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/cancel`, {});
    upsertOrder(order);
  }

  async function addEvidence(
    id: string,
    file: File,
    stage: EvidenceStage,
    type: EvidenceType,
    uploadedBy: UserRole
  ) {
    const order = await uploadEvidence(id, file, stage, type, uploadedBy);
    upsertOrder(order);
  }

  const value: OrdersContextValue = {
    orders,
    isLoading,
    getOrderById: (id) => orders.find((order) => order.id === id || order.displayId === id),
    getOrdersByStatus: (status) => (status ? orders.filter((order) => order.status === status) : orders),
    createOrder,
    payOrder,
    confirmReceipt,
    openDispute,
    markShipped,
    respondToDispute,
    upsertOrder,
    cancelOrder,
    addEvidence,
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}
