"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
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

export function ShipmentSheet({ orderId }: { orderId: string }) {
  const { markShipped } = useOrders();
  const [open, setOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: notificar a Trustless Work da mudança de etapa do contrato de escrow.
    await markShipped(orderId, trackingCode.trim());
    setOpen(false);
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

          <Button type="submit" size="lg" className="mt-2">
            Confirmar Envio
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
