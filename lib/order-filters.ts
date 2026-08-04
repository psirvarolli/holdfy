import type { Order, OrderStatus } from "@/lib/types";

export type StatusFilter = "todos" | Extract<OrderStatus, "pago_custodia" | "concluido" | "em_disputa">;

export type DateFilter = "todos" | "7d" | "30d";

export function filterOrders(
  allOrders: Order[],
  { query, status, date }: { query: string; status: StatusFilter; date: DateFilter }
): Order[] {
  let result = allOrders;

  if (status !== "todos") {
    result = result.filter((order) => order.status === status);
  }

  if (date !== "todos") {
    const days = date === "7d" ? 7 : 30;
    // Referência: data do pedido mais recente do dataset (os mocks usam Out/2023).
    const mostRecent = Math.max(...allOrders.map((o) => new Date(o.createdAt).getTime()));
    const cutoff = mostRecent - days * 24 * 60 * 60 * 1000;
    result = result.filter((order) => new Date(order.createdAt).getTime() >= cutoff);
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery) {
    result = result.filter(
      (order) =>
        order.displayId.toLowerCase().includes(normalizedQuery) ||
        order.counterpartyName.toLowerCase().includes(normalizedQuery) ||
        String(order.total).includes(normalizedQuery)
    );
  }

  return result;
}
