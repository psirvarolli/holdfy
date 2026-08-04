"use client";

import { ThumbsUp, CheckCircle2, Gavel, Clock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisputeSheet } from "@/components/shared/dispute-sheet";
import { ShipmentSheet } from "@/components/shared/shipment-sheet";
import { DisputeResponseSheet } from "@/components/shared/dispute-response-sheet";
import { useRole } from "@/lib/role-context";
import { useOrders } from "@/lib/orders-context";
import type { Order } from "@/lib/types";

export function OrderActions({ order }: { order: Order }) {
  const { role } = useRole();
  const { confirmReceipt } = useOrders();

  const isFinal = order.status === "concluido" || order.status === "liberado";
  const isDisputed = order.status === "em_disputa";
  const isShipped = order.status === "em_transito";
  // Pedidos semente antigos ficaram em disputa sem essa marcação — todas as
  // disputas eram abertas pelo comprador antes desta funcionalidade existir.
  const disputeOpenedBy = order.disputeOpenedBy ?? "comprador";

  if (role === "vendedor") {
    if (isDisputed) {
      const openedByMe = disputeOpenedBy === "vendedor";
      return (
        <Card className="flex flex-col gap-3 border border-error/30 bg-error-container/10">
          <div className="flex items-center gap-2 text-error">
            <Gavel className="size-5" />
            <h2 className="text-body-lg font-semibold">
              {openedByMe ? "Disputa Aberta por Você" : "Disputa Aberta"}
            </h2>
          </div>
          {order.disputeReason ? (
            <p className="text-body-md text-on-surface-variant">
              Motivo {openedByMe ? "informado por você" : "informado pelo comprador"}:{" "}
              <strong className="text-on-surface">{order.disputeReason}</strong>
            </p>
          ) : null}

          {openedByMe ? (
            order.buyerResponse ? (
              <p className="text-body-md text-on-surface-variant">
                Resposta do comprador: <strong className="text-on-surface">{order.buyerResponse}</strong>
              </p>
            ) : (
              <p className="text-label-sm text-on-surface-variant">Aguardando resposta do comprador.</p>
            )
          ) : order.sellerResponse ? (
            <div className="flex items-center gap-2 rounded-md bg-mint-teal/15 p-4 text-primary">
              <CheckCircle2 className="size-5 shrink-0" />
              <span className="text-body-md">Sua resposta foi enviada e está em análise pela Holdfy.</span>
            </div>
          ) : (
            <DisputeResponseSheet orderId={order.id} respondingAs="vendedor" />
          )}
        </Card>
      );
    }

    if (isFinal) {
      return (
        <Card className="flex flex-col gap-2">
          <h2 className="text-body-lg font-semibold text-on-surface">Ações do Pedido</h2>
          <div className="flex items-center gap-2 rounded-md bg-mint-teal/15 p-4 text-primary">
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="text-body-md">Pagamento liberado. Transação concluída.</span>
          </div>
        </Card>
      );
    }

    if (isShipped) {
      return (
        <Card className="flex flex-col gap-3">
          <h2 className="text-body-lg font-semibold text-on-surface">Ações do Pedido</h2>
          <div className="flex items-center gap-2 rounded-md bg-surface-container-high p-4 text-on-surface-variant">
            <Clock className="size-5 shrink-0" />
            <span className="text-body-md">
              Pedido enviado{order.trackingCode ? ` (rastreio: ${order.trackingCode})` : ""}.
              Aguardando confirmação de recebimento pelo comprador.
            </span>
          </div>
          <DisputeSheet orderId={order.id} perspective="vendedor" />
        </Card>
      );
    }

    return (
      <Card className="flex flex-col gap-3">
        <h2 className="text-body-lg font-semibold text-on-surface">Ações do Pedido</h2>
        <p className="text-body-md text-on-surface-variant">
          O pagamento já está protegido pela Holdfy. Prepare o pedido e marque como enviado
          assim que despachar.
        </p>
        <ShipmentSheet orderId={order.id} />
        <DisputeSheet orderId={order.id} perspective="vendedor" />
      </Card>
    );
  }

  // Comprador
  if (isDisputed) {
    const openedByMe = disputeOpenedBy === "comprador";
    return (
      <Card className="flex flex-col gap-3 border border-error/30 bg-error-container/10">
        <div className="flex items-center gap-2 text-error">
          <Gavel className="size-5" />
          <h2 className="text-body-lg font-semibold">
            {openedByMe ? "Disputa em Análise" : "Disputa Aberta pelo Vendedor"}
          </h2>
        </div>
        <p className="text-body-md text-on-surface-variant">
          Seu dinheiro continua retido em custódia enquanto a Holdfy analisa o caso com o
          vendedor.
        </p>
        {order.disputeReason ? (
          <p className="text-label-sm text-on-surface-variant">
            Motivo {openedByMe ? "informado por você" : "informado pelo vendedor"}: {order.disputeReason}
          </p>
        ) : null}

        {openedByMe ? (
          order.sellerResponse ? (
            <p className="text-label-sm text-on-surface-variant">
              Resposta do vendedor: <strong className="text-on-surface">{order.sellerResponse}</strong>
            </p>
          ) : (
            <p className="text-label-sm text-on-surface-variant">Aguardando resposta do vendedor.</p>
          )
        ) : order.buyerResponse ? (
          <div className="flex items-center gap-2 rounded-md bg-mint-teal/15 p-4 text-primary">
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="text-body-md">Sua resposta foi enviada e está em análise pela Holdfy.</span>
          </div>
        ) : (
          <DisputeResponseSheet orderId={order.id} respondingAs="comprador" />
        )}
      </Card>
    );
  }

  if (isFinal) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-body-lg font-semibold text-on-surface">Ações do Pedido</h2>
        <div className="flex items-center gap-2 rounded-md bg-mint-teal/15 p-4 text-primary">
          <ShieldCheck className="size-5 shrink-0" />
          <span className="text-body-md">Recebimento confirmado! O valor foi liberado ao vendedor.</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-body-lg font-semibold text-on-surface">Ações do Pedido</h2>
      <Button
        size="lg"
        // TODO: chamar Trustless Work para liberar os fundos do contrato de escrow (Soroban/Stellar).
        onClick={() => confirmReceipt(order.id)}
      >
        <ThumbsUp className="size-4" />
        Confirmar Recebimento
      </Button>
      <DisputeSheet orderId={order.id} perspective="comprador" />
      <p className="text-label-sm text-on-surface-variant">
        Confirme apenas se tiver recebido e testado o produto.
      </p>
    </Card>
  );
}
