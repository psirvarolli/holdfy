"use client";

import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EscrowCard } from "@/components/shared/escrow-card";
import { OrderRow } from "@/components/shared/order-row";
import { NewOrderSheet } from "@/components/shared/new-order-sheet";
import { useOrders } from "@/lib/orders-context";
import { getSellerMetrics } from "@/lib/mocks/orders";
import { formatCurrency } from "@/lib/format";

export function SellerDashboard() {
  const { orders } = useOrders();
  const metrics = getSellerMetrics(orders);
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Visão Geral"
        description="Acompanhe suas vendas e saldo em custódia."
        action={<NewOrderSheet />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <EscrowCard
          icon={ShieldCheck}
          label="Vendas Protegidas"
          value={String(metrics.protectedSalesCount)}
          helperText="+12% este mês"
        />
        <EscrowCard
          icon={Lock}
          label="Em Custódia Agora"
          value={formatCurrency(metrics.inEscrowTotal)}
          helperText="Disponível em 5 dias"
        />
        <EscrowCard
          icon={CheckCircle2}
          label="Transações Concluídas"
          value={formatCurrency(metrics.completedTotal)}
          helperText="Total acumulado"
        />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-card-border bg-card p-2">
        <div className="flex items-center justify-between px-4 pt-3">
          <h2 className="text-body-lg font-semibold text-on-surface">Pedidos Recentes</h2>
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
