"use client";

import { useState } from "react";
import { Truck, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/lib/orders-context";
import { EvidenceUploader } from "@/components/shared/evidence-uploader";
import type { Order } from "@/lib/types";

export function ShipmentSheet({ order }: { order: Order }) {
  const { markShipped } = useOrders();
  const [open, setOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await markShipped(order.id, trackingCode.trim());
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao marcar como enviado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg">
          <Truck className="size-4" />
          Marcar como Enviado
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Marcar como Enviado</SheetTitle>
          <SheetDescription>
            Avise o comprador que o pedido está a caminho. O valor continua retido até a
            confirmação de recebimento.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="trackingCode" className="text-label-sm text-on-surface-variant">
              Código de rastreio (opcional)
            </label>
            <Input
              id="trackingCode"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ex: BR99382211"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface-variant">
              Foto ou vídeo do produto embalado (opcional)
            </label>
            <p className="text-label-sm text-on-surface-variant/80">
              Serve como evidência caso o comprador abra uma disputa depois.
            </p>
            <EvidenceUploader order={order} stage="envio" uploadedBy="vendedor" />
          </div>

          {error ? <p className="text-label-sm text-error">{error}</p> : null}

          <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Enviando..." : "Confirmar Envio"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
