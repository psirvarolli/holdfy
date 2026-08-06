"use client";

import { Gavel } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { OrderRow } from "@/components/shared/order-row";
import { useOrders } from "@/lib/orders-context";

export default function AdminDisputesPage() {
  const { getOrdersByStatus, isLoading } = useOrders();
  const disputes = getOrdersByStatus("em_disputa");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Disputas Abertas" description="Pedidos aguardando decisão da Holdfy." />

      {isLoading ? null : disputes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-card-border bg-card p-12 text-center">
          <Gavel className="size-8 text-on-surface-variant" />
          <p className="text-body-md text-on-surface-variant">Nenhuma disputa em aberto.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-lg border border-card-border bg-card p-2">
          {disputes.map((order) => (
            <OrderRow key={order.id} order={order} href={`/admin/orders/${order.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
