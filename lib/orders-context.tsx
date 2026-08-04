"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Order, OrderStatus, UserRole } from "@/lib/types";

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
  isLoading: boolean;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status?: OrderStatus) => Order[];
  createOrder: (input: NewOrderInput) => Promise<Order>;
  confirmReceipt: (id: string) => Promise<void>;
  openDispute: (id: string, reason: string, openedBy: UserRole) => Promise<void>;
  markShipped: (id: string, trackingCode: string) => Promise<void>;
  respondToDispute: (id: string, response: string, respondedBy: UserRole) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Falha na requisição para ${url}: ${res.status}`);
  }
  return res.json();
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const { order } = await postJson<{ order: Order }>("/api/orders", input);
    upsertOrder(order);
    return order;
  }

  async function confirmReceipt(id: string) {
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/confirm-receipt`);
    upsertOrder(order);
  }

  async function openDispute(id: string, reason: string, openedBy: UserRole) {
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/dispute`, {
      reason,
      openedBy,
    });
    upsertOrder(order);
  }

  async function markShipped(id: string, trackingCode: string) {
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/ship`, { trackingCode });
    upsertOrder(order);
  }

  async function respondToDispute(id: string, response: string, respondedBy: UserRole) {
    const { order } = await postJson<{ order: Order }>(`/api/orders/${id}/dispute/respond`, {
      response,
      respondedBy,
    });
    upsertOrder(order);
  }

  const value: OrdersContextValue = {
    orders,
    isLoading,
    getOrderById: (id) => orders.find((order) => order.id === id || order.displayId === id),
    getOrdersByStatus: (status) => (status ? orders.filter((order) => order.status === status) : orders),
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
