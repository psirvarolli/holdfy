"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DisputeResolutionPanel } from "@/components/shared/dispute-resolution-panel";
import { EvidenceGallery } from "@/components/shared/evidence-gallery";
import { useOrders } from "@/lib/orders-context";
import { formatCurrency, formatDate } from "@/lib/format";

export function AdminOrderView({ id }: { id: string }) {
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
        <Link href="/admin/disputes" className="text-label-sm text-primary hover:underline">
          Voltar para Disputas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/disputes"
        className="flex items-center gap-2 text-label-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="size-4" />
        Voltar para Disputas
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Pedido {order.displayId}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-body-md">
          <span className="text-on-surface-variant">Vendedor</span>
          <span className="text-on-surface">{order.counterpartyName}</span>
        </div>
        <div className="flex items-center justify-between text-body-md">
          <span className="text-on-surface-variant">Total</span>
          <span className="text-on-surface">{formatCurrency(order.total)}</span>
        </div>
        <div className="flex items-center justify-between text-body-md">
          <span className="text-on-surface-variant">Criado em</span>
          <span className="text-on-surface">{formatDate(order.createdAt)}</span>
        </div>
        {order.escrowContractId ? (
          <div className="flex items-center justify-between gap-3 text-body-md">
            <span className="shrink-0 text-on-surface-variant">Contrato</span>
            <span className="truncate text-label-sm text-on-surface">{order.escrowContractId}</span>
          </div>
        ) : null}
      </Card>

      {order.disputeReason ? (
        <Card className="flex flex-col gap-2">
          <h2 className="text-body-lg font-semibold text-on-surface">Motivo da Disputa</h2>
          <p className="text-body-md text-on-surface-variant">
            Aberta por {order.disputeOpenedBy ?? "comprador"}: {order.disputeReason}
          </p>
          {order.buyerResponse ? (
            <p className="text-body-md text-on-surface-variant">
              Resposta do comprador: <strong className="text-on-surface">{order.buyerResponse}</strong>
            </p>
          ) : null}
          {order.sellerResponse ? (
            <p className="text-body-md text-on-surface-variant">
              Resposta do vendedor: <strong className="text-on-surface">{order.sellerResponse}</strong>
            </p>
          ) : null}
        </Card>
      ) : null}

      <EvidenceGallery order={order} />

      {order.status === "em_disputa" ? <DisputeResolutionPanel order={order} /> : null}
    </div>
  );
}
