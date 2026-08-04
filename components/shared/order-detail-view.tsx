"use client";

import Link from "next/link";
import { ArrowLeft, Package, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Card } from "@/components/ui/card";
import { useOrders } from "@/lib/orders-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { OrderActions } from "@/components/shared/order-actions";

export function OrderDetailView({ id }: { id: string }) {
  const { getOrderById, isLoading } = useOrders();
  const order = getOrderById(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-on-surface-variant" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-body-lg text-on-surface">Pedido não encontrado.</p>
        <Link href="/orders" className="text-label-sm text-primary hover:underline">
          Voltar para Pedidos
        </Link>
      </div>
    );
  }

  const subtotal = order.total - order.shippingCost;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/orders"
        className="flex items-center gap-2 text-label-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="size-4" />
        Voltar para Pedidos
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Pedido {order.displayId}
          </h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-body-md text-on-surface-variant">
          Criado em {formatDate(order.createdAt)}
        </p>
      </div>

      {order.timeline.length > 0 ? (
        <Card>
          <h2 className="mb-6 text-body-lg font-semibold text-on-surface">Status do Pedido</h2>
          <Timeline steps={order.timeline} />
        </Card>
      ) : null}

      <Card className="flex flex-col gap-4">
        <h2 className="text-body-lg font-semibold text-on-surface">Resumo do Pedido</h2>

        <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
          <span className="text-label-sm uppercase text-on-surface-variant">Vendedor</span>
          <span className="text-body-md text-on-surface">{order.counterpartyName}</span>
        </div>

        <div className="flex flex-col gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant">
                <Package className="size-6" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-body-md text-on-surface">{item.name}</span>
                <span className="text-label-sm text-on-surface-variant">Qtd: {item.quantity}</span>
                {order.sourceMarketplace && order.sourceUrl ? (
                  <a
                    href={order.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex w-fit items-center gap-1 text-label-sm text-primary hover:underline"
                  >
                    Importado do {order.sourceMarketplace}
                    <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </div>
              <span className="text-body-md text-on-surface">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
          <div className="flex items-center justify-between text-body-md text-on-surface-variant">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-body-md text-on-surface-variant">
            <span>Frete</span>
            <span>{formatCurrency(order.shippingCost)}</span>
          </div>
          <div className="flex items-center justify-between text-body-lg font-semibold text-on-surface">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 border border-mint-teal/30 bg-mint-teal/10">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-5" />
          <h2 className="text-body-lg font-semibold">Garantia Holdfy</h2>
        </div>
        <p className="text-body-md text-on-surface-variant">
          Seu dinheiro está guardado com segurança. Ele só será liberado ao vendedor após você
          confirmar o recebimento do produto em perfeitas condições.
        </p>
      </Card>

      <OrderActions order={order} />
    </div>
  );
}
