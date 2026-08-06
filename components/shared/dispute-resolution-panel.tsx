"use client";

import { useState } from "react";
import { Scale, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/lib/orders-context";
import type { Order } from "@/lib/types";

// Painel interno da Holdfy para decidir disputas — vive só dentro de
// app/admin/(protected), atrás do login próprio da equipe (ver proxy.ts e
// lib/server/admin-auth.ts). Não depende de login do Pollar.
//
// Trabalha em USDC, não em reais: o valor realmente retido no escrow é o que
// foi convertido e travado no momento do pagamento (order.escrowAmountUsdc),
// não o preço de listagem em reais (order.total) — ver lib/server/fx-rate.ts.
export function DisputeResolutionPanel({ order }: { order: Order }) {
  const { resolveDispute } = useOrders();
  const escrowTotal = order.escrowAmountUsdc ?? 0;
  const [buyerAmount, setBuyerAmount] = useState(String(escrowTotal));
  const [sellerAmount, setSellerAmount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyerValue = Number(buyerAmount.replace(",", "."));
  const sellerValue = Number(sellerAmount.replace(",", "."));
  const sum = (Number.isFinite(buyerValue) ? buyerValue : 0) + (Number.isFinite(sellerValue) ? sellerValue : 0);
  const isValid =
    Number.isFinite(buyerValue) && Number.isFinite(sellerValue) && Math.abs(sum - escrowTotal) < 0.01;

  async function handleResolve() {
    setIsSubmitting(true);
    setError(null);
    try {
      await resolveDispute(order.id, buyerValue, sellerValue);
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

      <Button variant="destructive" size="lg" onClick={handleResolve} disabled={!isValid || isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {isSubmitting ? "Resolvendo..." : "Confirmar Resolução"}
      </Button>
    </Card>
  );
}
