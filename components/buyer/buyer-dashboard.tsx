"use client";

import Link from "next/link";
import { Lock, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EscrowCard } from "@/components/shared/escrow-card";
import { OrderRow } from "@/components/shared/order-row";
import { useOrders } from "@/lib/orders-context";
import { getBuyerMetrics } from "@/lib/mocks/orders";
import { formatCurrency } from "@/lib/format";

export function BuyerDashboard() {
  const { orders } = useOrders();
  const metrics = getBuyerMetrics(orders);
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Olá, Alex"
        description="Aqui está o resumo das suas compras protegidas."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <EscrowCard
          icon={Lock}
          label="Total em Retenção"
          value={formatCurrency(metrics.totalHeld)}
        />
        <EscrowCard
          icon={CheckCircle2}
          label="Compras Concluídas"
          value={String(metrics.completedCount)}
          helperText="Transações liberadas"
        />
        <EscrowCard
          icon={Clock}
          iconClassName="bg-tertiary-container/30 text-tertiary"
          label="Aguardando Liberação"
          value={String(metrics.awaitingReleaseCount)}
          helperText={metrics.awaitingReleaseCount > 0 ? "Requer sua atenção" : undefined}
          helperClassName="text-tertiary"
        />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-card-border bg-card p-2">
        <div className="flex items-center justify-between px-4 pt-3">
          <h2 className="text-body-lg font-semibold text-on-surface">Histórico de Pedidos</h2>
          <Link href="/orders" className="text-label-sm text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="flex flex-col">
          {recentOrders.map((order) => (
            <OrderRow key={order.id} order={order} href={`/orders/${order.id}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
