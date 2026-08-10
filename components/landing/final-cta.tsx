"use client";

import { Reveal } from "@/components/landing/reveal";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

export function FinalCta({ onOpenLead }: { onOpenLead: (source: string) => void }) {
  const { locale } = useLandingLocale();
  const { finalCta } = landingDictionary[locale];

  return (
    <section className="cta-band" data-testid="final-cta-section">
      <div className="container-hf">
        <Reveal>
          <h2 className="headline-lg">{finalCta.title}</h2>
          <p className="body-lg">{finalCta.subtitle}</p>
          <div>
            <button className="btn btn-light btn-lg" onClick={() => onOpenLead("cta-final")} data-testid="final-cta-button">
              {finalCta.primaryCta}
            </button>
            <a href="#como-funciona" className="btn btn-ghost-light btn-lg" data-testid="final-cta-secondary">
              {finalCta.secondaryCta}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
