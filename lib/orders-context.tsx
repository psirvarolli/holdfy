"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { orders as seedOrders, getOrderById, getOrdersByStatus } from "@/lib/mocks/orders";
import { formatTimelineTimestamp } from "@/lib/format";
import type { Order, OrderStatus, UserRole } from "@/lib/types";

const STORAGE_KEY = "holdfy-orders";
const INITIAL_NEXT_ID = 9600;

export interface NewOrderInput {
  counterpartyName: string;
  itemName: string;
  price: number;
  shippingCost: number;
  sourceUrl?: string;
  sourceMarketplace?: string;
}

interface OrdersContextValue {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status?: OrderStatus) => Order[];
  createOrder: (input: NewOrderInput) => Order;
  confirmReceipt: (id: string) => void;
  openDispute: (id: string, reason: string, openedBy: UserRole) => void;
  markShipped: (id: string, trackingCode: string) => void;
  respondToDispute: (id: string, response: string, respondedBy: UserRole) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [hydrated, setHydrated] = useState(false);
  const nextId = useRef(INITIAL_NEXT_ID);

  // Reidrata pedidos criados/alterados em sessões anteriores (persistidos no
  // localStorage) para que o estado mockado sobreviva a um refresh da página.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { orders: Order[]; nextId: number };
        setOrders(parsed.orders);
        nextId.current = parsed.nextId;
      }
    } catch {
      // dados corrompidos no localStorage — mantém os dados semente
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ orders, nextId: nextId.current }));
  }, [orders, hydrated]);

  function updateOrder(id: string, updater: (order: Order) => Order) {
    setOrders((prev) => prev.map((order) => (order.id === id ? updater(order) : order)));
  }

  function createOrder(input: NewOrderInput): Order {
    const n = nextId.current++;
    const now = new Date();
    const newOrder: Order = {
      id: `ord-${n}`,
      displayId: `#${n}-BR`,
      status: "pago_custodia",
      createdAt: now.toISOString(),
      counterpartyName: input.counterpartyName,
      description: input.itemName,
      items: [{ id: `item-${n}-1`, name: input.itemName, quantity: 1, price: input.price }],
      shippingCost: input.shippingCost,
      total: input.price + input.shippingCost,
      sourceUrl: input.sourceUrl,
      sourceMarketplace: input.sourceMarketplace,
      timeline: [
        {
          id: "pagamento_confirmado",
          title: "Pagamento Confirmado",
          description: "O pagamento foi capturado e está retido na Holdfy.",
          timestamp: formatTimelineTimestamp(now),
          state: "concluido",
        },
        {
          id: "confirmado_vendedor",
          title: "Em Processamento",
          description: "Aguardando o vendedor preparar o pedido para envio.",
          timestamp: null,
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
          description: "Aguardando confirmação de entrega para liberar o valor ao vendedor.",
          timestamp: null,
          state: "pendente",
        },
      ],
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }

  function confirmReceipt(id: string) {
    updateOrder(id, (order) => ({
      ...order,
      status: "liberado",
      timeline: order.timeline.map((step) => {
        if (step.id === "entregue") {
          return {
            ...step,
            state: "concluido",
            description: "Recebimento confirmado. Valor liberado ao vendedor.",
            timestamp: formatTimelineTimestamp(new Date()),
          };
        }
        return step.state === "atual" ? { ...step, state: "concluido" } : step;
      }),
    }));
  }

  function openDispute(id: string, reason: string, openedBy: UserRole) {
    updateOrder(id, (order) => ({
      ...order,
      status: "em_disputa",
      disputeReason: reason,
      disputeOpenedBy: openedBy,
      sellerResponse: undefined,
      buyerResponse: undefined,
    }));
  }

  function markShipped(id: string, trackingCode: string) {
    updateOrder(id, (order) => ({
      ...order,
      status: "em_transito",
      trackingCode: trackingCode || order.trackingCode,
      timeline: order.timeline.map((step) => {
        if (step.id === "confirmado_vendedor" && step.state === "atual") {
          return { ...step, state: "concluido" };
        }
        if (step.id === "em_transito") {
          return {
            ...step,
            state: "atual",
            timestamp: formatTimelineTimestamp(new Date()),
            description: trackingCode
              ? `O pedido foi despachado. Rastreio: ${trackingCode}.`
              : "O pedido foi despachado pelo vendedor.",
          };
        }
        return step;
      }),
    }));
  }

  function respondToDispute(id: string, response: string, respondedBy: UserRole) {
    updateOrder(id, (order) =>
      respondedBy === "vendedor"
        ? { ...order, sellerResponse: response }
        : { ...order, buyerResponse: response }
    );
  }

  const value: OrdersContextValue = {
    orders,
    getOrderById: (id) => getOrderById(orders, id),
    getOrdersByStatus: (status) => getOrdersByStatus(orders, status),
    createOrder,
    confirmReceipt,
    openDispute,
    markShipped,
    respondToDispute,
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}
