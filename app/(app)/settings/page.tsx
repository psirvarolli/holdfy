"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Wallet, Landmark, Palette, Copy, Check, MapPin, Percent, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, RefreshCw, MessageCircle, Pencil, X, TrendingUp } from "lucide-react";
import { usePollar } from "@pollar/react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSwitch } from "@/components/shared/role-switch";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useRole } from "@/lib/role-context";
import { useTheme } from "@/lib/theme-context";
import { useUsdcBalance } from "@/lib/pollar-balance";
import { useSellerPlanStatus } from "@/lib/plans-client";
import { useSellerWhatsapp, linkSellerWhatsapp, unlinkSellerWhatsapp } from "@/lib/seller-whatsapp-client";
import { useSellerProfile, saveMonthlyRevenue } from "@/lib/seller-profile-client";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

// Mesma regra do bot (holdfy-whatsapp/apps/bot/src/phone.ts): sem código de
// país digitado, assume Brasil (10-11 dígitos = DDD + número); com código de
// país, usa como veio.
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  if (digits.length >= 12 && digits.length <= 15) return `+${digits}`;
  return null;
}

function WhatsappCard() {
  const { wallet } = usePollar();
  const { link, isLoading, refresh } = useSellerWhatsapp();
  const [editing, setEditing] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!wallet) {
      setError("Sua carteira ainda não está pronta. Aguarde um instante e tente de novo.");
      return;
    }
    const normalized = normalizePhone(phoneInput);
    if (!normalized) {
      setError("Número inválido. Digite com DDD, ex: 11999998888.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await linkSellerWhatsapp(normalized);
      setEditing(false);
      setPhoneInput("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao vincular o WhatsApp.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnlink() {
    if (!wallet) return;
    setSaving(true);
    try {
      await unlinkSellerWhatsapp();
      refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-on-surface">
        <MessageCircle className="size-5" />
        <h2 className="text-body-lg font-semibold">WhatsApp</h2>
      </div>
      <p className="text-body-md text-on-surface-variant">
        Vincule seu número para criar pedidos protegidos direto pelo WhatsApp, pelo Holdfy Bot —
        os pedidos criados por lá usam a carteira desta conta.
      </p>

      {!editing && link ? (
        <div className="flex items-center justify-between rounded-md border border-input-border bg-input px-4 py-3">
          <span className="text-body-md text-on-surface">{link.phone}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPhoneInput(link.phone.replace(/^\+55/, ""));
                setEditing(true);
              }}
            >
              <Pencil className="size-4" />
              Trocar
            </Button>
            <Button variant="outline" size="sm" onClick={handleUnlink} disabled={saving}>
              <X className="size-4" />
              Remover
            </Button>
          </div>
        </div>
      ) : !editing ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-surface-container-high px-4 py-3">
          <span className="text-body-md text-on-surface-variant">
            {isLoading ? "Carregando..." : "Nenhum número vinculado ainda."}
          </span>
          <Button size="sm" onClick={() => setEditing(true)} disabled={isLoading}>
            Vincular número
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="11999998888"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              disabled={saving}
            />
            <Button size="sm" onClick={handleSave} disabled={saving}>
              Salvar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
          {error ? <p className="text-label-sm text-error">{error}</p> : null}
        </div>
      )}
    </Card>
  );
}

function MonthlyRevenueCard() {
  const { wallet } = usePollar();
  const { profile, isLoading, refresh } = useSellerProfile();
  const [editing, setEditing] = useState(false);
  const [valueInput, setValueInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!wallet) {
      setError("Sua carteira ainda não está pronta. Aguarde um instante e tente de novo.");
      return;
    }
    const value = Number(valueInput.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) {
      setError("Valor inválido. Digite só números, ex: 15000 ou 15000,00.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveMonthlyRevenue(value);
      setEditing(false);
      setValueInput("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar o faturamento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-on-surface">
        <TrendingUp className="size-5" />
        <h2 className="text-body-lg font-semibold">Faturamento Mensal</h2>
      </div>
      <p className="text-body-md text-on-surface-variant">
        Quanto sua empresa fatura por mês, em média — ajuda a Holdfy a entender melhor o seu
        negócio.
      </p>

      {!editing && profile ? (
        <div className="flex items-center justify-between rounded-md border border-input-border bg-input px-4 py-3">
          <span className="text-body-md text-on-surface">
            {formatCurrency(profile.monthlyRevenueReais)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setValueInput(String(profile.monthlyRevenueReais));
              setEditing(true);
            }}
          >
            <Pencil className="size-4" />
            Trocar
          </Button>
        </div>
      ) : !editing ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-surface-container-high px-4 py-3">
          <span className="text-body-md text-on-surface-variant">
            {isLoading ? "Carregando..." : "Ainda não informado."}
          </span>
          <Button size="sm" onClick={() => setEditing(true)} disabled={isLoading}>
            Informar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              inputMode="decimal"
              placeholder="0,00"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              disabled={saving}
            />
            <Button size="sm" onClick={handleSave} disabled={saving}>
              Salvar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
          {error ? <p className="text-label-sm text-error">{error}</p> : null}
        </div>
      )}
    </Card>
  );
}

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
                  {planStatus
                    ? `${planStatus.billedFeePercent ?? planStatus.plan.feePercent}%`
                    : "..."}
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
            {planStatus?.billedFeePercent != null ? (
              <p className="rounded-md border border-tertiary/30 bg-tertiary-container/30 px-3 py-2 text-label-sm text-tertiary">
                Você já usou os pedidos incluídos do plano {planStatus.plan.name} este mês —
                novos pedidos estão sendo cobrados a {planStatus.billedFeePercent}% (taxa do
                Starter) até o mês virar.
              </p>
            ) : null}
            {planStatus?.plan.maxTxValueReais ? (
              <p className="text-label-sm text-on-surface-variant">
                Limite de {formatCurrency(planStatus.plan.maxTxValueReais)} por pedido neste
                plano.
              </p>
            ) : null}
          </Card>

          <MonthlyRevenueCard />
          <WhatsappCard />
        </>
      )}
    </div>
  );
}
