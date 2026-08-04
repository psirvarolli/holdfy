"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
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
import type { UserRole } from "@/lib/types";

export function DisputeResponseSheet({
  orderId,
  respondingAs,
}: {
  orderId: string;
  respondingAs: UserRole;
}) {
  const { respondToDispute } = useOrders();
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!response.trim()) return;
    // TODO: enviar evidências para a Trustless Work mediar a disputa no contrato de escrow.
    respondToDispute(orderId, response.trim(), respondingAs);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg">
          <MessageSquareText className="size-4" />
          Responder Disputa
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Responder Disputa</SheetTitle>
          <SheetDescription>
            Envie sua versão dos fatos e evidências (comprovante de envio, fotos, conversas). O
            valor permanece retido até a decisão.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="response" className="text-label-sm text-on-surface-variant">
              Sua resposta
            </label>
            <textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={5}
              placeholder="Explique o que aconteceu do seu lado..."
              className="rounded-md border border-input-border bg-input p-3 text-body-md text-on-surface outline-none focus:border-2 focus:border-primary"
              required
            />
          </div>

          <Button type="submit" size="lg" className="mt-2">
            Enviar Resposta
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
