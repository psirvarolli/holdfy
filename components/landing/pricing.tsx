"use client";

import { Check } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { FeeCalculator } from "@/components/landing/fee-calculator";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

// Behavior/logic per plan (which one is highlighted, which lead-source id it
// reports) — not translatable content, kept parallel to dict.pricing.plans
// by index instead of living in the dictionary.
const PLAN_META = [
  { featured: false, source: "plano-starter" },
  { featured: true, source: "plano-pro" },
  { featured: false, source: "plano-enterprise" },
];

export function Pricing({ onOpenLead }: { onOpenLead: (source: string) => void }) {
  const { locale } = useLandingLocale();
  const { pricing } = landingDictionary[locale];

  return (
    <section id="precos" className="section section-alt" data-testid="pricing-section">
      <div className="container-hf">
        <Reveal>
          <div className="section-head center">
            <span className="chip">{pricing.eyebrow}</span>
            <h2 className="headline-lg">{pricing.title}</h2>
            <p className="body-md">{pricing.subtitle}</p>
          </div>
        </Reveal>
        <div className="pricing-grid">
          {pricing.plans.map((plan, i) => {
            const meta = PLAN_META[i];
            return (
              <Reveal key={plan.name} delay={i * 100}>
                <div
                  className={`card plan-card ${meta.featured ? "featured" : ""}`}
                  data-testid={`plan-card-${plan.name.toLowerCase()}`}
                >
                  {meta.featured && (
                    <span className="plan-badge" data-testid="plan-pro-badge">
                      {pricing.mostPopular}
                    </span>
                  )}
                  <h3 className="title-md" style={{ margin: 0 }}>
                    {plan.name}
                  </h3>
                  <p className="plan-audience">{plan.audience}</p>
                  <div className="plan-price">
                    <span className="value">{plan.price}</span>
                    <span className="suffix">{plan.suffix}</span>
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <Check size={17} strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`btn ${meta.featured ? "btn-primary" : "btn-secondary"}`}
                    style={{ width: "100%" }}
                    onClick={() => onOpenLead(meta.source)}
                    data-testid={`plan-cta-${plan.name.toLowerCase()}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={150}>
          <FeeCalculator />
        </Reveal>
      </div>
    </section>
  );
}
