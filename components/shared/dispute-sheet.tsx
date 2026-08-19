"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/lib/orders-context";

const BUYER_REASONS = [
  "Produto não recebido",
  "Produto diferente do anunciado",
  "Produto com defeito",
  "Vendedor não responde",
  "Outro motivo",
];

const SELLER_REASONS = [
  "Comprador não confirma o recebimento",
  "Suspeita de fraude no pagamento",
  "Cancelamento solicitado indevidamente",
  "Produto devolvido em condição diferente",
  "Outro motivo",
];

interface DisputeSheetProps {
  orderId: string;
  perspective?: "comprador" | "vendedor";
}

export function DisputeSheet({ orderId, perspective = "comprador" }: DisputeSheetProps) {
  const { openDispute } = useOrders();
  const [open, setOpen] = useState(false);
  const reasons = perspective === "vendedor" ? SELLER_REASONS : BUYER_REASONS;
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const description =
    perspective === "vendedor"
      ? "O valor permanece retido em custódia enquanto a disputa é analisada. Conte o que aconteceu para que possamos mediar com o comprador."
      : "O valor continua retido em custódia enquanto a disputa é analisada. Conte o que aconteceu para que possamos mediar com o vendedor.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const fullReason = details.trim() ? `${reason} — ${details.trim()}` : reason;
      await openDispute(orderId, fullReason);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao abrir a disputa.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="destructive" size="lg">
          <AlertTriangle className="size-4" />
          Abrir Disputa
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Abrir Disputa</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reason" className="text-label-sm text-on-surface-variant">
              Motivo
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-11 rounded-md border border-input-border bg-input px-4 text-body-md text-on-surface outline-none focus:border-2 focus:border-primary"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="details" className="text-label-sm text-on-surface-variant">
              Detalhes (opcional)
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Descreva o que aconteceu com o pedido..."
              className="rounded-md border border-input-border bg-input p-3 text-body-md text-on-surface outline-none focus:border-2 focus:border-primary"
            />
          </div>

          {error ? <p className="text-label-sm text-error">{error}</p> : null}

          <Button type="submit" variant="destructive" size="lg" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Enviando..." : "Confirmar Disputa"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
