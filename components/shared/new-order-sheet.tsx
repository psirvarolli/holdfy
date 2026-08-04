"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Link2,
  PenLine,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
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
import {
  fetchMarketplaceListing,
  isValidListingUrl,
  type MarketplaceListing,
} from "@/lib/marketplace";

type Step = "choice" | "link" | "manual";
type FetchState = "idle" | "loading" | "done" | "error";

const CHOICES: {
  step: Extract<Step, "link" | "manual">;
  icon: typeof Link2;
  title: string;
  description: string;
  cta: string;
}[] = [
  {
    step: "link",
    icon: Link2,
    title: "Importar de Anúncio",
    description: "Cole o link de um anúncio e a Holdfy preenche os dados automaticamente.",
    cta: "Importar Link",
  },
  {
    step: "manual",
    icon: PenLine,
    title: "Criar Manualmente",
    description: "Preencha você mesmo a descrição, o valor e o frete do pedido.",
    cta: "Preencher Manualmente",
  },
];

export function NewOrderSheet() {
  const router = useRouter();
  const { createOrder } = useOrders();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choice");

  const [listingUrl, setListingUrl] = useState("");
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [listing, setListing] = useState<MarketplaceListing | null>(null);

  const [counterpartyName, setCounterpartyName] = useState("");
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [shippingCost, setShippingCost] = useState("");

  const priceValue = Number(price.replace(",", "."));
  const isValid = counterpartyName.trim().length > 0 && itemName.trim().length > 0 && priceValue > 0;

  function resetForm() {
    setStep("choice");
    setListingUrl("");
    setFetchState("idle");
    setListing(null);
    setCounterpartyName("");
    setItemName("");
    setPrice("");
    setShippingCost("");
  }

  async function handleFetchListing() {
    if (!isValidListingUrl(listingUrl)) {
      setFetchState("error");
      return;
    }
    setFetchState("loading");
    // TODO: chamar um serviço real de scraping/parsing no backend (ver lib/marketplace.ts).
    const result = await fetchMarketplaceListing(listingUrl);
    setListing(result);
    setItemName(result.title);
    setPrice(String(result.price));
    setShippingCost(String(result.shippingCost));
    setFetchState("done");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    // TODO: chamar Trustless Work para criar o contrato de escrow (Soroban/Stellar)
    // e a BlindPay para gerar o link de cobrança PIX correspondente.
    const order = createOrder({
      counterpartyName: counterpartyName.trim(),
      itemName: itemName.trim(),
      price: priceValue,
      shippingCost: Number(shippingCost.replace(",", ".")) || 0,
      sourceUrl: listing ? listingUrl : undefined,
      sourceMarketplace: listing?.marketplace,
    });

    resetForm();
    setOpen(false);
    router.push(`/orders/${order.id}`);
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
            {step === "choice"
              ? "Como você quer criar essa cobrança protegida em custódia?"
              : "O comprador paga via Pix e o valor só é liberado após a confirmação de recebimento."}
          </SheetDescription>
        </SheetHeader>

        {step === "choice" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {CHOICES.map((choice) => (
              <button
                key={choice.step}
                type="button"
                onClick={() => setStep(choice.step)}
                className="flex flex-col items-center gap-3 rounded-lg border border-card-border bg-card p-6 text-center transition-colors hover:border-primary"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-mint-teal/15 text-primary">
                  <choice.icon className="size-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-body-lg font-semibold text-on-surface">{choice.title}</h3>
                  <p className="text-label-sm text-on-surface-variant">{choice.description}</p>
                </div>
                <span className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-mint-teal px-4 text-label-md text-deep-carbon">
                  {choice.cta}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep("choice")}
              className="flex w-fit items-center gap-2 text-label-sm text-on-surface-variant hover:text-on-surface"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </button>

            {step === "link" ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="listingUrl" className="text-label-sm text-on-surface-variant">
                    Link do anúncio (Mercado Livre, Shopee, Amazon, OLX...)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                      <Input
                        id="listingUrl"
                        value={listingUrl}
                        onChange={(e) => {
                          setListingUrl(e.target.value);
                          setFetchState("idle");
                        }}
                        placeholder="https://..."
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleFetchListing}
                      disabled={fetchState === "loading" || listingUrl.trim().length === 0}
                    >
                      {fetchState === "loading" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Buscar"
                      )}
                    </Button>
                  </div>
                  {fetchState === "error" ? (
                    <p className="text-label-sm text-error">Cole um link válido para continuar.</p>
                  ) : null}
                  {fetchState === "loading" ? (
                    <p className="text-label-sm text-on-surface-variant">
                      Buscando informações do anúncio...
                    </p>
                  ) : null}
                </div>

                {listing ? (
                  <div className="flex flex-col gap-2 rounded-md border border-mint-teal/30 bg-mint-teal/10 p-3">
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span className="text-label-sm font-semibold">
                        Importado do {listing.marketplace}
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">{listing.description}</p>
                    <a
                      href={listingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-fit items-center gap-1 text-label-sm text-primary hover:underline"
                    >
                      Ver anúncio original
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}

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

              <div className="grid grid-cols-2 gap-3">
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
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="shippingCost" className="text-label-sm text-on-surface-variant">
                    Frete (R$)
                  </label>
                  <Input
                    id="shippingCost"
                    inputMode="decimal"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" disabled={!isValid} className="mt-2">
                Gerar cobrança Pix
              </Button>
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
