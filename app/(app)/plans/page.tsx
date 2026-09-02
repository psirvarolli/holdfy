"use client";

import { useState } from "react";
import { usePollar } from "@pollar/react";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/lib/role-context";
import { usePlans, useSellerPlanStatus, subscribeToPro, cancelProSubscription } from "@/lib/plans-client";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Plan } from "@/lib/types";

// Recomendação de faturamento por plano — só apresentacional, não vem do
// banco (Plan não carrega esse dado; não há necessidade de mais uma coluna
// pra um texto fixo por slug).
const PLAN_REVENUE_RECOMMENDATION: Partial<Record<Plan["slug"], string>> = {
  starter: "Ideal para quem fatura até R$10.000/mês",
  pro: "Ideal para quem fatura acima de R$10.000/mês",
};

function PlanCard({
  plan,
  isCurrent,
  currentPeriodEnd,
  canSubscribe,
  onSubscribe,
  isSubscribing,
  onCancel,
  isCancelling,
}: {
  plan: Plan;
  isCurrent: boolean;
  currentPeriodEnd?: string;
  canSubscribe: boolean;
  onSubscribe: () => void;
  isSubscribing: boolean;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-body-lg font-semibold text-on-surface">{plan.name}</h2>
        {isCurrent ? <Badge variant="mint">Plano atual</Badge> : null}
      </div>

      <div>
        <span className="text-headline-lg-mobile text-on-surface">
          {formatCurrency(plan.monthlyPriceReais)}
        </span>
        <span className="text-body-md text-on-surface-variant"> /mês</span>
      </div>

      {PLAN_REVENUE_RECOMMENDATION[plan.slug] ? (
        <p className="rounded-md bg-mint-teal/15 px-3 py-2 text-label-sm font-medium text-primary">
          {PLAN_REVENUE_RECOMMENDATION[plan.slug]}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 border-t border-outline-variant pt-4 text-body-md text-on-surface-variant">
        <div className="flex items-center justify-between">
          <span>Taxa por pedido</span>
          <span className="font-semibold text-on-surface">{plan.feePercent}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Limite incluído</span>
          <span className="text-on-surface">
            {plan.includedEscrows ? `${plan.includedEscrows} pedidos/mês` : "Sem limite de pedidos"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Valor máximo por pedido</span>
          <span className="text-on-surface">
            {plan.maxTxValueReais ? formatCurrency(plan.maxTxValueReais) : "Sem limite"}
          </span>
        </div>
      </div>

      {isCurrent && plan.slug === "pro" && currentPeriodEnd ? (
        <p className="text-label-sm text-on-surface-variant">
          Válido até {formatDate(currentPeriodEnd)} — a InfinitePay não renova sozinha, é preciso
          pagar de novo antes de vencer para não voltar ao Starter.
        </p>
      ) : null}

      {plan.slug === "pro" && canSubscribe ? (
        <Button onClick={onSubscribe} disabled={isSubscribing} variant={isCurrent ? "outline" : "primary"}>
          {isSubscribing ? <Loader2 className="size-4 animate-spin" /> : null}
          {isSubscribing ? "Redirecionando..." : isCurrent ? "Renovar" : "Assinar"}
        </Button>
      ) : plan.slug === "starter" && canSubscribe && !isCurrent ? (
        <Button variant="outline" onClick={onCancel} disabled={isCancelling}>
          {isCancelling ? <Loader2 className="size-4 animate-spin" /> : null}
          {isCancelling ? "Voltando..." : "Voltar para o Starter"}
        </Button>
      ) : isCurrent ? (
        <Button variant="outline" disabled>
          Plano atual
        </Button>
      ) : null}
    </Card>
  );
}

export default function PlansPage() {
  const { role } = useRole();
  const { wallet } = usePollar();
  const { plans, isLoading: isLoadingPlans } = usePlans();
  const { status, isLoading: isLoadingStatus, refresh } = useSellerPlanStatus();
  const [subscribingSlug, setSubscribingSlug] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Lê a query string direto (sem useSearchParams) pra não precisar embrulhar
  // a página inteira num <Suspense> só por causa desse detalhe de retorno do
  // pagamento — roda uma vez, na inicialização do state, não num efeito.
  const [returningFromCheckout] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("checkout") === "retorno"
  );

  const isSeller = role === "vendedor";

  async function handleSubscribe(plan: Plan) {
    if (!wallet?.address) {
      setError("Sua carteira ainda não está pronta. Aguarde um instante e tente de novo.");
      return;
    }
    setError(null);
    setSubscribingSlug(plan.slug);
    try {
      const url = await subscribeToPro();
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao iniciar a assinatura.");
      setSubscribingSlug(null);
    }
  }

  async function handleCancel() {
    setError(null);
    setIsCancelling(true);
    try {
      await cancelProSubscription();
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao voltar para o Starter.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Planos"
        description="A taxa que a Holdfy cobra em cada pedido depende do plano do vendedor."
      />

      {returningFromCheckout ? (
        <Card className="flex items-center justify-between gap-3 border border-mint-teal/30 bg-mint-teal/10">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <p className="text-body-md text-on-surface-variant">
              Voltando do pagamento? Pode levar alguns segundos até confirmar aqui — se seu
              pagamento pelo Pix ou cartão foi concluído, atualize em instantes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            className="flex shrink-0 items-center gap-1 text-label-sm text-primary hover:underline"
          >
            <RefreshCw className="size-3.5" />
            Atualizar
          </button>
        </Card>
      ) : null}

      {!isSeller ? (
        <Card className="text-body-md text-on-surface-variant">
          Planos definem a taxa que o vendedor paga em cada pedido — troque para o papel de
          vendedor nas Configurações para assinar um plano.
        </Card>
      ) : null}

      {isSeller && status?.status === "expired" ? (
        <Card className="text-body-md text-on-surface-variant border border-tertiary/40 bg-tertiary-container/10">
          Seu plano Pro venceu e não foi renovado — pedidos novos já estão usando a taxa do
          Starter. Renove abaixo para voltar à taxa reduzida.
        </Card>
      ) : null}

      {isSeller && status?.escrowsUsedThisMonth != null && status.plan.includedEscrows ? (
        <Card className="text-body-md text-on-surface-variant">
          Você usou{" "}
          <strong className="text-on-surface">
            {status.escrowsUsedThisMonth} de {status.plan.includedEscrows}
          </strong>{" "}
          pedidos incluídos no seu plano este mês.
          {status.escrowsUsedThisMonth >= status.plan.includedEscrows
            ? " Pedidos adicionais usam a taxa do plano Starter até o próximo mês."
            : ""}
        </Card>
      ) : null}

      {error ? <p className="text-label-sm text-error">{error}</p> : null}

      {isLoadingPlans || (isSeller && isLoadingStatus) ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-on-surface-variant" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard
              key={plan.slug}
              plan={plan}
              isCurrent={isSeller && status?.plan.slug === plan.slug}
              currentPeriodEnd={status?.currentPeriodEnd}
              canSubscribe={isSeller}
              onSubscribe={() => void handleSubscribe(plan)}
              isSubscribing={subscribingSlug === plan.slug}
              onCancel={() => void handleCancel()}
              isCancelling={isCancelling}
            />
          ))}
        </div>
      )}
    </div>
  );
}
