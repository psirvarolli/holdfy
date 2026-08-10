"use client";

import { BadgeCheck, MessagesSquare, PackageCheck, QrCode } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

const ICONS = [MessagesSquare, QrCode, PackageCheck, BadgeCheck];

export function HowItWorks() {
  const { locale } = useLandingLocale();
  const { howItWorks } = landingDictionary[locale];

  return (
    <section id="como-funciona" className="section" data-testid="how-it-works-section">
      <div className="container-hf">
        <Reveal>
          <div className="section-head center">
            <span className="chip">{howItWorks.eyebrow}</span>
            <h2 className="headline-lg">{howItWorks.title}</h2>
            <p className="body-md">{howItWorks.subtitle}</p>
          </div>
        </Reveal>
        <ol className="steps">
          {howItWorks.steps.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <li key={step.title}>
                <Reveal delay={i * 120}>
                  <div className="step" data-testid={`step-${i + 1}`}>
                    <span className="step-num">{i + 1}</span>
                    <span className="step-icon">
                      <Icon size={26} strokeWidth={1.8} />
                    </span>
                    <h3 className="title-md">{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
