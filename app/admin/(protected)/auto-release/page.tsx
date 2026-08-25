"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { OrderRow } from "@/components/shared/order-row";
import { AUTO_RELEASE_DAYS, isEligibleForAutoRelease, type Order } from "@/lib/types";

export default function AdminAutoReleasePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/orders")
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((data: { orders: Order[] }) => {
        if (!cancelled) setOrders(data.orders ?? []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const eligible = orders.filter(isEligibleForAutoRelease);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Liberação Automática"
        description={`Pedidos enviados há mais de ${AUTO_RELEASE_DAYS} dias, sem confirmação de recebimento nem disputa aberta.`}
      />

      {isLoading ? null : eligible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-card-border bg-card p-12 text-center">
          <Clock className="size-8 text-on-surface-variant" />
          <p className="text-body-md text-on-surface-variant">Nenhum pedido elegível no momento.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-lg border border-card-border bg-card p-2">
          {eligible.map((order) => (
            <OrderRow key={order.id} order={order} href={`/admin/orders/${order.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
