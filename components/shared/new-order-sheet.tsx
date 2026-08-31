"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";

// A importação automática de anúncios (Mercado Livre, OLX, AliExpress...)
// existe em lib/marketplace.ts + lib/server/marketplace.ts + a rota
// /api/marketplace/lookup, testada e funcionando tecnicamente — mas hoje os
// grandes marketplaces bloqueiam a busca automática (Mercado Livre, Magazine
// Luiza e OLX recusam a conexão; a AliExpress só carrega os dados via
// JavaScript no navegador da pessoa, não no HTML que o servidor recebe). A
// única forma confiável testada é a API oficial do Mercado Livre, que exige
// criar um app de desenvolvedor lá — combinamos deixar isso para depois. Por
// ora, o formulário vai direto para o preenchimento manual.
export function NewOrderSheet() {
  const router = useRouter();
  const { createOrder } = useOrders();
  const [open, setOpen] = useState(false);

  const [counterpartyName, setCounterpartyName] = useState("");
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [hasShipping, setHasShipping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceValue = Number(price.replace(",", "."));
  const isValid = counterpartyName.trim().length > 0 && itemName.trim().length > 0 && priceValue > 0;

  function resetForm() {
    setCounterpartyName("");
    setItemName("");
    setPrice("");
    setHasShipping(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        counterpartyName: counterpartyName.trim(),
        itemName: itemName.trim(),
        price: priceValue,
        hasShipping,
        shippingCost: 0,
      });

      resetForm();
      setOpen(false);
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o pedido. Tente de novo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <SheetTrigger asChild>
        <Button size="lg">
          <Plus className="size-4" />
          Novo Pedido
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Pedido</SheetTitle>
          <SheetDescription>
            O comprador paga e o valor fica retido até a confirmação de recebimento.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="counterpartyName" className="text-label-sm text-on-surface-variant">
              Nome do comprador
            </label>
            <Input
              id="counterpartyName"
              value={counterpartyName}
              onChange={(e) => setCounterpartyName(e.target.value)}
              placeholder="Ex: Mariana Costa"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="itemName" className="text-label-sm text-on-surface-variant">
              Descrição do produto ou serviço
            </label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Ex: Consultoria de UX"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface-variant">Tipo de produto</label>
            <div className="flex items-center gap-1 rounded-full bg-surface-container-high p-1">
              {(
                [
                  { value: true, label: "Físico" },
                  { value: false, label: "Digital" },
                ] as const
              ).map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => setHasShipping(option.value)}
                  className={cn(
                    "flex-1 rounded-full px-3 py-1.5 text-label-sm transition-colors",
                    hasShipping === option.value
                      ? "bg-mint-teal text-deep-carbon"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {!hasShipping ? (
              <p className="text-label-sm text-on-surface-variant">
                Produto digital: sem frete e sem etapa de envio — o pedido vai direto para o
                comprador confirmar o recebimento assim que pagar.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="price" className="text-label-sm text-on-surface-variant">
              Valor (R$)
            </label>
            <Input
              id="price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          {error ? <p className="text-label-sm text-error">{error}</p> : null}

          <Button type="submit" size="lg" disabled={!isValid || isSubmitting} className="mt-2">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Criando..." : "Criar Pedido"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
