"use client";

import { FileSearch, QrCode, ShieldCheck } from "lucide-react";
import { WhatsAppSim } from "@/components/landing/whatsapp-sim";
import { Reveal } from "@/components/landing/reveal";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

export function Hero({ onOpenLead }: { onOpenLead: (source: string) => void }) {
  const { locale } = useLandingLocale();
  const { hero } = landingDictionary[locale];

  return (
    <section className="hero" data-testid="hero-section">
      <div className="container-hf hero-grid">
        <div className="hero-copy">
          <Reveal>
            <span className="chip" data-testid="hero-kicker">
              <ShieldCheck size={14} />
              {hero.kicker}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-lg" style={{ margin: 0 }}>
              {hero.title}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="body-lg" style={{ margin: 0, color: "var(--on-surface-variant)", maxWidth: 520 }}>
              {hero.subtitle}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="hero-ctas">
              <button className="btn btn-primary btn-lg" onClick={() => onOpenLead("hero")} data-testid="hero-primary-cta">
                {hero.primaryCta}
              </button>
              <a href="#como-funciona" className="btn btn-secondary btn-lg" data-testid="hero-secondary-cta">
                {hero.secondaryCta}
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="hero-badges" data-testid="hero-trust-badges">
              <span className="chip">
                <ShieldCheck size={13} /> {hero.badges[0]}
              </span>
              <span className="chip">
                <QrCode size={13} /> {hero.badges[1]}
              </span>
              <span className="chip">
                <FileSearch size={13} /> {hero.badges[2]}
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="hero-phone">
          <WhatsAppSim />
        </Reveal>
      </div>
    </section>
  );
}
