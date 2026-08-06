"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Wallet, Landmark, Palette, Copy, Check, MapPin, Percent, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, RefreshCw } from "lucide-react";
import { usePollar } from "@pollar/react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleSwitch } from "@/components/shared/role-switch";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useRole } from "@/lib/role-context";
import { useTheme } from "@/lib/theme-context";
import { useUsdcBalance } from "@/lib/pollar-balance";
import { useSellerPlanStatus } from "@/lib/plans-client";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (ex: contexto não seguro) — ignora silenciosamente
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copiado" : "Copiar"}
    </Button>
  );
}

export default function SettingsPage() {
  const { role } = useRole();
  const { theme } = useTheme();
  const { wallet, openKycModal, openRampModal } = usePollar();
  const { available: usdcBalance, isLoading: isLoadingBalance, refresh: refreshBalance } = useUsdcBalance();
  const { status: planStatus } = useSellerPlanStatus();

  function verifyIdentity() {
    openKycModal({ country: "BR", level: "basic" });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configurações" description="Gerencie seu perfil e preferências." />

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-on-surface">
          <User className="size-5" />
          <h2 className="text-body-lg font-semibold">Perfil</h2>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">Visualizando como</span>
          <RoleSwitch />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-on-surface">
          <Palette className="size-5" />
          <h2 className="text-body-lg font-semibold">Aparência</h2>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">
            Tema {theme === "light" ? "claro" : "escuro"}
          </span>
          <ThemeToggle />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-on-surface">
          <Wallet className="size-5" />
          <h2 className="text-body-lg font-semibold">Carteira</h2>
        </div>
        <p className="text-body-md text-on-surface-variant">
          Sua carteira é criada e protegida automaticamente pela Holdfy — você não precisa
          gerenciar chaves ou frases de recuperação.
        </p>
        {wallet ? (
          <div className="flex items-center justify-between rounded-md border border-input-border bg-input px-4 py-3">
            <span className="truncate text-body-md text-on-surface">{wallet.address}</span>
            <CopyButton value={wallet.address} />
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">Saldo disponível</span>
          <div className="flex items-center gap-2">
            <span className="text-body-md font-semibold text-on-surface">
              {isLoadingBalance ? "..." : `${usdcBalance.toFixed(2)} USDC`}
            </span>
            <button
              type="button"
              onClick={() => refreshBalance()}
              aria-label="Atualizar saldo"
              className="text-on-surface-variant hover:text-on-surface"
            >
              <RefreshCw className={cn("size-4", isLoadingBalance && "animate-spin")} />
            </button>
          </div>
        </div>
      </Card>

      {role === "comprador" ? (
        <>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface">
              <Landmark className="size-5" />
              <h2 className="text-body-lg font-semibold">Método de Pagamento</h2>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Para pagar um pedido, sua carteira precisa ter USDC — compre com Pix a qualquer
              momento. O valor entra em custódia protegida assim que você paga um pedido.
            </p>
            <div className="flex items-center justify-between gap-3 rounded-md border border-input-border bg-input px-4 py-3">
              <span className="text-body-md text-on-surface">
                Saldo: {isLoadingBalance ? "..." : `${usdcBalance.toFixed(2)} USDC`}
              </span>
              <Button size="sm" onClick={() => openRampModal()}>
                <ArrowDownToLine className="size-4" />
                Comprar USDC via Pix
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md bg-surface-container-high px-4 py-3">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <ShieldCheck className="size-4" />
                <span className="text-body-md">
                  Verificação de identidade obrigatória para converter Pix em USDC.
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={verifyIdentity}>
                Verificar identidade
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface">
              <MapPin className="size-5" />
              <h2 className="text-body-lg font-semibold">Endereço de Entrega</h2>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Av. Paulista, 777 — Bela Vista, São Paulo/SP
            </p>
          </Card>
        </>
      ) : (
        <>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface">
              <Landmark className="size-5" />
              <h2 className="text-body-lg font-semibold">Dados de Recebimento</h2>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Quando um pedido é liberado, o valor cai em USDC na sua carteira — saque para o
              Pix da sua conta quando quiser.
            </p>
            <div className="flex items-center justify-between gap-3 rounded-md border border-input-border bg-input px-4 py-3">
              <span className="text-body-md text-on-surface">
                Saldo: {isLoadingBalance ? "..." : `${usdcBalance.toFixed(2)} USDC`}
              </span>
              <Button size="sm" onClick={() => openRampModal()}>
                <ArrowUpFromLine className="size-4" />
                Sacar em Pix
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md bg-surface-container-high px-4 py-3">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <ShieldCheck className="size-4" />
                <span className="text-body-md">
                  Verificação de identidade obrigatória para converter USDC em Pix.
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={verifyIdentity}>
                Verificar identidade
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface">
                <Percent className="size-5" />
                <h2 className="text-body-lg font-semibold">Taxas e Plano</h2>
              </div>
              <Link href="/plans" className="text-label-sm text-primary hover:underline">
                Ver planos
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-md bg-surface-container-high px-3 py-2">
                <span className="text-body-md font-semibold text-on-surface">
                  {planStatus ? planStatus.plan.name : "..."}
                </span>
                <span className="text-label-sm text-on-surface-variant">Plano atual</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md bg-surface-container-high px-3 py-2">
                <span className="text-body-md font-semibold text-on-surface">
                  {planStatus ? `${planStatus.plan.feePercent}%` : "..."}
                </span>
                <span className="text-label-sm text-on-surface-variant">Taxa por pedido</span>
              </div>
            </div>
            {planStatus?.escrowsUsedThisMonth != null && planStatus.plan.includedEscrows ? (
              <p className="text-label-sm text-on-surface-variant">
                {planStatus.escrowsUsedThisMonth} de {planStatus.plan.includedEscrows} pedidos
                incluídos usados este mês.
              </p>
            ) : null}
            {planStatus?.plan.maxTxValueReais ? (
              <p className="text-label-sm text-on-surface-variant">
                Limite de {formatCurrency(planStatus.plan.maxTxValueReais)} por pedido neste
                plano.
              </p>
            ) : null}
          </Card>
        </>
      )}
    </div>
  );
}
