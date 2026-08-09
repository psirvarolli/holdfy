"use client";

import { useEffect, useState } from "react";
import { Scale, Loader2, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/lib/orders-context";
import { networkPassphrase } from "@/lib/stellar-client-network";
import type { Order } from "@/lib/types";

// Painel interno da Holdfy para decidir disputas — vive só dentro de
// app/admin/(protected), atrás do login próprio da equipe (ver proxy.ts e
// lib/server/admin-auth.ts). Não depende de login do Pollar.
//
// Resolver uma disputa move dinheiro sozinho (a conta disputeResolver
// distribui o valor retido pra quem o painel decidir), por isso exige 2
// assinaturas: a chave automática do servidor (já aplicada no passo /build)
// e a assinatura pessoal de quem está no painel agora, via Freighter — nem a
// Holdfy sozinha, nem uma chave vazada sozinha, resolvem uma disputa.
//
// Trabalha em USDC, não em reais: o valor realmente retido no escrow é o que
// foi convertido e travado no momento do pagamento (order.escrowAmountUsdc),
// não o preço de listagem em reais (order.total) — ver lib/server/fx-rate.ts.
export function DisputeResolutionPanel({ order }: { order: Order }) {
  const { upsertOrder } = useOrders();
  const escrowTotal = order.escrowAmountUsdc ?? 0;
  const [buyerAmount, setBuyerAmount] = useState(String(escrowTotal));
  const [sellerAmount, setSellerAmount] = useState("0");
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

  const buyerValue = Number(buyerAmount.replace(",", "."));
  const sellerValue = Number(sellerAmount.replace(",", "."));
  const sum = (Number.isFinite(buyerValue) ? buyerValue : 0) + (Number.isFinite(sellerValue) ? sellerValue : 0);
  const isValid =
    Number.isFinite(buyerValue) && Number.isFinite(sellerValue) && Math.abs(sum - escrowTotal) < 0.01;

  async function handleResolve() {
    if (!freighterAddress) {
      setError("Conecte o Freighter primeiro — a resolução precisa da sua assinatura.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const buildRes = await fetch(`/api/admin/orders/${order.id}/resolve-dispute/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerAmount: buyerValue, sellerAmount: sellerValue }),
      });
      const buildData = await buildRes.json();
      if (!buildRes.ok) throw new Error(buildData.error ?? "Falha ao montar a resolução da disputa.");

      const freighter = await import("@stellar/freighter-api");
      const { signedTxXdr, error: signError } = await freighter.signTransaction(
        buildData.partiallySignedTransaction,
        { networkPassphrase, address: freighterAddress }
      );
      if (signError || !signedTxXdr) {
        throw new Error("Assinatura cancelada ou recusada no Freighter.");
      }

      const submitRes = await fetch(`/api/admin/orders/${order.id}/resolve-dispute/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerAmount: buyerValue, sellerAmount: sellerValue, signedTransaction: signedTxXdr }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error ?? "Falha ao enviar a resolução da disputa.");

      upsertOrder(submitData.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao resolver a disputa.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!order.escrowAmountUsdc) {
    return (
      <Card className="flex flex-col gap-2 border border-tertiary/40 bg-tertiary-container/10">
        <div className="flex items-center gap-2 text-tertiary">
          <Scale className="size-5" />
          <h2 className="text-body-lg font-semibold">Resolver Disputa (Holdfy)</h2>
        </div>
        <p className="text-body-md text-on-surface-variant">
          Este pedido não tem um valor de escrow registrado — não é possível resolver a
          disputa por aqui.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 border border-tertiary/40 bg-tertiary-container/10">
      <div className="flex items-center gap-2 text-tertiary">
        <Scale className="size-5" />
        <h2 className="text-body-lg font-semibold">Resolver Disputa (Holdfy)</h2>
      </div>
      <p className="text-body-md text-on-surface-variant">
        Defina como o valor total ({escrowTotal.toFixed(2)} USDC) retido em custódia será
        dividido entre as partes. A soma precisa bater exatamente com o total — este é o
        valor real em USDC depositado no escrow, não o preço de listagem em reais
        ({order.total.toFixed(2)} R$).
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
              Resolver exige sua assinatura pessoal (2ª chave da conta disputeResolver).
            </span>
            <Button variant="outline" size="sm" onClick={connectFreighter}>
              Conectar Freighter
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="buyerAmount" className="text-label-sm text-on-surface-variant">
            Valor para o comprador (USDC)
          </label>
          <Input
            id="buyerAmount"
            inputMode="decimal"
            value={buyerAmount}
            onChange={(e) => setBuyerAmount(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sellerAmount" className="text-label-sm text-on-surface-variant">
            Valor para o vendedor (USDC)
          </label>
          <Input
            id="sellerAmount"
            inputMode="decimal"
            value={sellerAmount}
            onChange={(e) => setSellerAmount(e.target.value)}
          />
        </div>
      </div>

      {!isValid ? (
        <p className="text-label-sm text-error">
          A soma dos dois valores precisa ser igual a {escrowTotal.toFixed(2)} USDC.
        </p>
      ) : null}
      {error ? <p className="text-label-sm text-error">{error}</p> : null}

      <Button
        variant="destructive"
        size="lg"
        onClick={handleResolve}
        disabled={!isValid || isSubmitting || !freighterAddress}
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {isSubmitting ? "Resolvendo..." : "Assinar e Confirmar Resolução"}
      </Button>
    </Card>
  );
}
