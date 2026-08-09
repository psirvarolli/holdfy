"use client";

import Link from "next/link";
import { ShieldCheck, Gavel, ArrowRight, CheckCircle2, Stamp } from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ChatMockup } from "@/components/landing/chat-mockup";
import { HeroReceipt } from "@/components/landing/hero-receipt";
import { ReceiptStrip } from "@/components/landing/receipt-strip";
import { ReceiptFrame } from "@/components/landing/receipt-frame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/lib/locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

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
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-lacre/15 px-3 py-1 text-label-sm text-lacre">
              <ShieldCheck className="size-3.5" />
              {hero.eyebrow}
            </span>
            <h1 className="font-display text-display-hero-mobile uppercase text-on-surface md:text-display-hero">
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

          <HeroReceipt
            orderId={heroMockup.orderId}
            itemName={heroMockup.itemName}
            value={heroMockup.value}
            waitingLabel={heroMockup.waitingLabel}
            sealedLabel={heroMockup.sealedLabel}
          />
        </section>

        {/* Stats */}
        <section className="border-y border-outline-variant bg-surface-container-low">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 md:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
                <span className="font-mono text-headline-md text-on-surface">{stat.value}</span>
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
              <h2 className="font-display text-display-section uppercase text-on-surface">
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
              <h2 className="font-display text-display-section uppercase text-on-surface">
                {dict.nav.comoFunciona}
              </h2>
            </div>
            <ReceiptStrip steps={steps} notchBg="var(--color-surface-container-low)" />
          </div>
        </section>

        {/* Para quem é */}
        <section id="para-quem" className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-display-section uppercase text-on-surface">
              {forWhom.title}
            </h2>
            <p className="text-body-lg text-on-surface-variant">{forWhom.subtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <ReceiptFrame className="flex flex-col gap-5">
              <h3 className="font-mono text-label-sm uppercase tracking-wide opacity-60">{forWhom.buyerTitle}</h3>
              <ul className="flex flex-col gap-3">
                {forWhom.buyerBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-body-md">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint-teal" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <hr className="holdfy-receipt-divider" />
              <Button asChild variant="secondary" className="w-fit">
                <Link href="/dashboard">{forWhom.buyerCta}</Link>
              </Button>
            </ReceiptFrame>
            <ReceiptFrame className="flex flex-col gap-5">
              <h3 className="font-mono text-label-sm uppercase tracking-wide opacity-60">{forWhom.sellerTitle}</h3>
              <ul className="flex flex-col gap-3">
                {forWhom.sellerBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-body-md">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint-teal" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <hr className="holdfy-receipt-divider" />
              <Button asChild variant="secondary" className="w-fit">
                <Link href="/dashboard">{forWhom.sellerCta}</Link>
              </Button>
            </ReceiptFrame>
          </div>
        </section>

        {/* Segurança */}
        <section id="seguranca" className="bg-surface-container-low">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-display-section uppercase text-on-surface">
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
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-carimbo/15 px-3 py-1 text-label-sm text-carimbo">
                  <Stamp className="size-3.5" />
                  {security.auditBadge}
                </span>
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
              <h2 className="font-display text-display-section uppercase text-on-surface">
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
            <h2 className="font-display text-display-section uppercase text-on-surface">
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
