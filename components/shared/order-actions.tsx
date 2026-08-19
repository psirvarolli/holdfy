"use client";

import { useState } from "react";
import { usePollar } from "@pollar/react";
import { ThumbsUp, CheckCircle2, Gavel, Clock, ShieldCheck, Wallet, Loader2, ArrowDownToLine, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisputeSheet } from "@/components/shared/dispute-sheet";
import { ShipmentSheet } from "@/components/shared/shipment-sheet";
import { DisputeResponseSheet } from "@/components/shared/dispute-response-sheet";
import { EvidenceUploader } from "@/components/shared/evidence-uploader";
import { useRole } from "@/lib/role-context";
import { useOrders } from "@/lib/orders-context";
import { useUsdcBalance } from "@/lib/pollar-balance";
import { useBrlToUsdcPreview } from "@/lib/fx-client";
import { formatCurrency } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderActions({ order }: { order: Order }) {
  const { role } = useRole();
  const { payOrder, confirmReceipt, cancelOrder } = useOrders();
  const { openRampModal } = usePollar();
  const { available: usdcBalance, isLoading: isLoadingBalance, refresh: refreshBalance } = useUsdcBalance();
  // Antes do escrow existir, `escrowAmountUsdc` ainda não foi travado — usa a
  // prévia da cotação atual só para mostrar uma estimativa.
  const { usdc: estimatedUsdc, isLoading: isLoadingEstimate } = useBrlToUsdcPreview(order.total);
  const usdcNeeded = order.escrowAmountUsdc ?? estimatedUsdc;
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const isAwaitingPayment = order.status === "aguardando_pagamento";
  const isCancelled = order.status === "cancelado";
  const isFinal = order.status === "concluido" || order.status === "liberado";
  const isDisputed = order.status === "em_disputa";
  const isShipped = order.status === "em_transito";
  // Pedidos semente antigos ficaram em disputa sem essa marcação — todas as
  // disputas eram abertas pelo comprador antes desta funcionalidade existir.
  const disputeOpenedBy = order.disputeOpenedBy ?? "comprador";

  async function handlePay() {
    setIsPaying(true);
    setPayError(null);
    try {
      await payOrder(order.id);
    } catch (error) {
      setPayError(error instanceof Error ? error.message : "Falha ao pagar o pedido.");
    } finally {
      setIsPaying(false);
    }
  }

  async function handleConfirmReceipt() {
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await confirmReceipt(order.id);
    } catch (error) {
      setConfirmError(error instanceof Error ? error.message : "Falha ao confirmar o recebimento.");
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleCancel() {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await cancelOrder(order.id);
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : "Falha ao cancelar o pedido.");
    } finally {
      setIsCancelling(false);
    }
  }

  if (isCancelled) {
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-body-lg font-semibold text-on-surface">Ações do Pedido</h2>
        <div className="flex items-center gap-2 rounded-md bg-surface-container-high p-4 text-on-surface-variant">
          <XCircle className="size-5 shrink-0" />
          <span className="text-body-md">Este pedido foi cancelado.</span>
        </div>
      </Card>
    );
  }

  if (role === "vendedor") {
    if (isAwaitingPayment) {
      return (
        <Card className="flex flex-col gap-3">
          <h2 className="text-body-lg font-semibold text-on-surface">Ações do Pedido</h2>
          <div className="flex items-center gap-2 rounded-md bg-surface-container-high p-4 text-on-surface-variant">
            <Wallet className="size-5 shrink-0" />
            <span className="text-body-md">Aguardando o comprador pagar este pedido.</span>
          </div>
          <Button variant="outline" onClick={handleCancel} disabled={isCancelling}>
            {isCancelling ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
            {isCancelling ? "Cancelando..." : "Cancelar Pedido"}
          </Button>
          {cancelError ? <p className="text-label-sm text-error">{cancelError}</p> : null}
        </Card>
      );
    }

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
            <DisputeResponseSheet orderId={order.id} />
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

    if (!order.hasShipping) {
      return (
        <Card className="flex flex-col gap-3">
          <h2 className="text-body-lg font-semibold text-on-surface">Ações do Pedido</h2>
          <div className="flex items-center gap-2 rounded-md bg-surface-container-high p-4 text-on-surface-variant">
            <Clock className="size-5 shrink-0" />
            <span className="text-body-md">
              Produto digital — liberado automaticamente para o comprador. Aguardando ele
              confirmar o recebimento para o valor ser liberado a você.
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
        <ShipmentSheet order={order} />
        <DisputeSheet orderId={order.id} perspective="vendedor" />
      </Card>
    );
  }

  // Comprador
  if (isAwaitingPayment) {
    const isChecking = isLoadingBalance || isLoadingEstimate || usdcNeeded === null;
    const hasEnoughBalance = usdcNeeded !== null && usdcBalance >= usdcNeeded;
    return (
      <Card className="flex flex-col gap-3">
        <h2 className="text-body-lg font-semibold text-on-surface">Ações do Pedido</h2>
        <p className="text-body-md text-on-surface-variant">
          Pague via Pix para que o valor de {formatCurrency(order.total)} fique protegido até
          você confirmar o recebimento.
        </p>

        <Button size="lg" variant="secondary" onClick={() => openRampModal()}>
          <ArrowDownToLine className="size-4" />
          Pagar com Pix
        </Button>

        {isChecking ? (
          <Button size="lg" disabled>
            <Loader2 className="size-4 animate-spin" />
            Verificando pagamento...
          </Button>
        ) : (
          <Button size="lg" onClick={handlePay} disabled={isPaying || !hasEnoughBalance}>
            {isPaying ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
            {isPaying ? "Confirmando..." : "Confirmar Pagamento"}
          </Button>
        )}
        {!isChecking && !hasEnoughBalance ? (
          <button
            type="button"
            onClick={() => refreshBalance()}
            className="text-label-sm text-primary hover:underline"
          >
            Já paguei — atualizar
          </button>
        ) : null}
        {payError ? <p className="text-label-sm text-error">{payError}</p> : null}

        <Button variant="outline" onClick={handleCancel} disabled={isCancelling}>
          {isCancelling ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
          {isCancelling ? "Cancelando..." : "Cancelar Pedido"}
        </Button>
        {cancelError ? <p className="text-label-sm text-error">{cancelError}</p> : null}
      </Card>
    );
  }

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
          <DisputeResponseSheet orderId={order.id} />
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

      <div className="flex flex-col gap-1.5">
        <label className="text-label-sm text-on-surface-variant">
          Foto ou vídeo do que você recebeu (opcional)
        </label>
        <p className="text-label-sm text-on-surface-variant/80">
          Registre antes de confirmar — ajuda numa eventual disputa.
        </p>
        <EvidenceUploader order={order} stage="recebimento" uploadedBy="comprador" />
      </div>

      <Button size="lg" onClick={handleConfirmReceipt} disabled={isConfirming}>
        {isConfirming ? <Loader2 className="size-4 animate-spin" /> : <ThumbsUp className="size-4" />}
        {isConfirming ? "Confirmando..." : "Confirmar Recebimento"}
      </Button>
      {confirmError ? <p className="text-label-sm text-error">{confirmError}</p> : null}
      <DisputeSheet orderId={order.id} perspective="comprador" />
      <p className="text-label-sm text-on-surface-variant">
        Confirme apenas se tiver recebido e testado o produto.
      </p>
    </Card>
  );
}
