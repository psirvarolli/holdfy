"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  ThumbsUp,
  Gavel,
  Truck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ChatMockup } from "@/components/landing/chat-mockup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { useLocale } from "@/lib/locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

const STEP_ICONS = [Lock, Truck, ThumbsUp];

export default function LandingPage() {
  const { locale } = useLocale();
  const dict = landingDictionary[locale];
  const { hero, heroMockup, stats, chatSection, chatGeneral, steps, forWhom, security, disputeSection, disputeChat, finalCta } = dict;

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:px-8 md:py-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-mint-teal/15 px-3 py-1 text-label-sm text-primary">
              <ShieldCheck className="size-3.5" />
              {hero.eyebrow}
            </span>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {hero.title}
            </h1>
            <p className="text-body-lg text-on-surface-variant">{hero.subtitle}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  {hero.ctaPrimary}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#como-funciona">{hero.ctaSecondary}</a>
              </Button>
            </div>
          </div>

          {/* Mockup reaproveitando os mesmos componentes da plataforma */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm text-on-surface-variant">{heroMockup.orderId}</p>
                <p className="text-body-lg font-semibold text-on-surface">{heroMockup.itemName}</p>
              </div>
              <StatusBadge status="pago_custodia" label={heroMockup.statusLabel} />
            </div>
            <div className="border-t border-outline-variant pt-4">
              <Timeline
                steps={[
                  {
                    id: "pagamento_confirmado",
                    title: heroMockup.step1Title,
                    description: heroMockup.step1Desc,
                    timestamp: heroMockup.step1Time,
                    state: "concluido",
                  },
                  {
                    id: "confirmado_vendedor",
                    title: heroMockup.step2Title,
                    description: heroMockup.step2Desc,
                    timestamp: heroMockup.step2Time,
                    state: "atual",
                  },
                ]}
              />
            </div>
          </Card>
        </section>

        {/* Stats */}
        <section className="border-y border-outline-variant bg-surface-container-low">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 md:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-headline-md text-on-surface">{stat.value}</span>
                <span className="text-label-sm text-on-surface-variant">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Pagamentos na conversa (WhatsApp) */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="flex flex-col gap-4 md:order-2">
              <span className="w-fit rounded-full bg-mint-teal/15 px-3 py-1 text-label-sm uppercase tracking-wide text-primary">
                {chatSection.eyebrow}
              </span>
              <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
                {chatSection.title}
              </h2>
              <p className="text-body-lg text-on-surface-variant">{chatSection.subtitle}</p>
            </div>
            <ChatMockup content={chatGeneral} className="md:order-1" />
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="bg-surface-container-low">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
              <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
                {dict.nav.comoFunciona}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = STEP_ICONS[index];
                return (
                  <Card key={step.title} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-teal/15 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <span className="text-label-sm text-on-surface-variant">{index + 1}</span>
                    </div>
                    <h3 className="text-body-lg font-semibold text-on-surface">{step.title}</h3>
                    <p className="text-body-md text-on-surface-variant">{step.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Para quem é */}
        <section id="para-quem" className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
            <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {forWhom.title}
            </h2>
            <p className="text-body-lg text-on-surface-variant">{forWhom.subtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex flex-col gap-5">
              <h3 className="text-body-lg font-semibold text-on-surface">{forWhom.buyerTitle}</h3>
              <ul className="flex flex-col gap-3">
                {forWhom.buyerBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button asChild variant="secondary" className="mt-auto w-fit">
                <Link href="/dashboard">{forWhom.buyerCta}</Link>
              </Button>
            </Card>
            <Card className="flex flex-col gap-5">
              <h3 className="text-body-lg font-semibold text-on-surface">{forWhom.sellerTitle}</h3>
              <ul className="flex flex-col gap-3">
                {forWhom.sellerBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button asChild variant="secondary" className="mt-auto w-fit">
                <Link href="/dashboard">{forWhom.sellerCta}</Link>
              </Button>
            </Card>
          </div>
        </section>

        {/* Segurança */}
        <section id="seguranca" className="bg-surface-container-low">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div className="flex flex-col gap-4">
                <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
                  {security.title}
                </h2>
                <p className="text-body-lg text-on-surface-variant">{security.description}</p>
                <ul className="flex flex-col gap-3">
                  {security.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Card className="flex flex-col gap-3 border border-mint-teal/30 bg-mint-teal/10">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-5" />
                  <h3 className="text-body-lg font-semibold">{security.guaranteeTitle}</h3>
                </div>
                <p className="text-body-md text-on-surface-variant">{security.guaranteeDescription}</p>
                <div className="flex items-center gap-2 pt-2">
                  <Gavel className="size-4 text-tertiary" />
                  <span className="text-label-sm text-on-surface-variant">{security.disputeNote}</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Resolução de disputas na conversa */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <ChatMockup content={disputeChat} />
            <div className="flex flex-col gap-4">
              <span className="w-fit rounded-full bg-error-container/40 px-3 py-1 text-label-sm uppercase tracking-wide text-error">
                {disputeSection.eyebrow}
              </span>
              <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
                {disputeSection.title}
              </h2>
              <p className="text-body-lg text-on-surface-variant">{disputeSection.description}</p>
              <ul className="flex flex-col gap-3">
                {disputeSection.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-outline-variant bg-surface-container-low">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8 md:py-24">
            <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {finalCta.title}
            </h2>
            <p className="max-w-xl text-body-lg text-on-surface-variant">{finalCta.subtitle}</p>
            <Button asChild size="lg">
              <Link href="/dashboard">
                {finalCta.button}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
