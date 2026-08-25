"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { networkPassphrase } from "@/lib/stellar-client-network";
import { formatDate } from "@/lib/format";
import type { Order } from "@/lib/types";

// Fork simplificado de dispute-resolution-panel.tsx — mesmo caminho de
// assinatura 2-de-2 (chave automática do servidor, já aplicada no passo
// /build + a pessoal de quem está no painel, via Freighter), mas sem os
// campos de valor: isto não é uma disputa, é ausência de resposta do
// comprador depois do prazo, então a divisão é sempre fixa em 100% pro
// vendedor. Só aparece quando lib/server/orders.ts já considera o pedido
// elegível (a rota /build recusa se não estiver, então o único jeito de dar
// erro aqui é o estado ter mudado entre a tela carregar e o clique).
export function AutoReleasePanel({
  order,
  onResolved,
}: {
  order: Order;
  onResolved: (order: Order) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freighterAddress, setFreighterAddress] = useState<string | null>(null);
  const [checkingFreighter, setCheckingFreighter] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const freighter = await import("@stellar/freighter-api");
      const { isConnected } = await freighter.isConnected();
      if (cancelled || !isConnected) return;
      const { address, error: addressError } = await freighter.getAddress();
      if (!cancelled && !addressError && address) setFreighterAddress(address);
    })().finally(() => {
      if (!cancelled) setCheckingFreighter(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function connectFreighter() {
    setError(null);
    const freighter = await import("@stellar/freighter-api");
    const { isConnected } = await freighter.isConnected();
    if (!isConnected) {
      setError("A extensão Freighter não foi encontrada. Instale em freighter.app e recarregue a página.");
      return;
    }
    const { address, error: accessError } = await freighter.requestAccess();
    if (accessError || !address) {
      setError("Não foi possível conectar ao Freighter.");
      return;
    }
    setFreighterAddress(address);
  }

  async function handleRelease() {
    if (!freighterAddress) {
      setError("Conecte o Freighter primeiro — a liberação precisa da sua assinatura.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const buildRes = await fetch(`/api/admin/orders/${order.id}/auto-release/build`, {
        method: "POST",
      });
      const buildData = await buildRes.json();
      if (!buildRes.ok) throw new Error(buildData.error ?? "Falha ao montar a liberação automática.");

      const freighter = await import("@stellar/freighter-api");
      const { signedTxXdr, error: signError } = await freighter.signTransaction(
        buildData.partiallySignedTransaction,
        { networkPassphrase, address: freighterAddress }
      );
      if (signError || !signedTxXdr) {
        throw new Error("Assinatura cancelada ou recusada no Freighter.");
      }

      const submitRes = await fetch(`/api/admin/orders/${order.id}/auto-release/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTransaction: signedTxXdr }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error ?? "Falha ao enviar a liberação automática.");

      onResolved(submitData.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao liberar automaticamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 border border-tertiary/40 bg-tertiary-container/10">
      <div className="flex items-center gap-2 text-tertiary">
        <Clock className="size-5" />
        <h2 className="text-body-lg font-semibold">Liberação Automática por Prazo</h2>
      </div>
      <p className="text-body-md text-on-surface-variant">
        {order.shippedAt ? `Enviado em ${formatDate(order.shippedAt)}. ` : null}
        O comprador não confirmou o recebimento nem abriu disputa dentro do prazo. Libere o
        valor retido para o vendedor com sua assinatura.
      </p>

      <div className="flex items-center gap-2 rounded-lg border border-tertiary/30 bg-surface px-3 py-2.5">
        <Wallet className="size-4 shrink-0 text-tertiary" />
        {checkingFreighter ? (
          <span className="text-label-sm text-on-surface-variant">Verificando o Freighter…</span>
        ) : freighterAddress ? (
          <span className="text-label-sm text-on-surface-variant">
            Assinando como {freighterAddress.slice(0, 4)}…{freighterAddress.slice(-4)}
          </span>
        ) : (
          <>
            <span className="flex-1 text-label-sm text-on-surface-variant">
              Liberar exige sua assinatura pessoal (2ª chave da conta disputeResolver).
            </span>
            <Button variant="outline" size="sm" onClick={connectFreighter}>
              Conectar Freighter
            </Button>
          </>
        )}
      </div>

      {error ? <p className="text-label-sm text-error">{error}</p> : null}

      <Button variant="primary" size="lg" onClick={handleRelease} disabled={isSubmitting || !freighterAddress}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {isSubmitting ? "Liberando..." : "Assinar e Liberar para o Vendedor"}
      </Button>
    </Card>
  );
}
