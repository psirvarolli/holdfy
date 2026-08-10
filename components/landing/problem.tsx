"use client";

import { FileWarning, HandCoins, Scale } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

const ICONS = [HandCoins, FileWarning, Scale];

export function Problem() {
  const { locale } = useLandingLocale();
  const { problem } = landingDictionary[locale];

  return (
    <section id="problema" className="section section-alt" data-testid="problem-section">
      <div className="container-hf">
        <Reveal>
          <div className="section-head center">
            <span className="chip">{problem.eyebrow}</span>
            <h2 className="headline-lg">{problem.title}</h2>
            <p className="body-md">{problem.subtitle}</p>
          </div>
        </Reveal>
        <div className="grid-3">
          {problem.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={item.title} delay={i * 100}>
                <div className="card problem-card" data-testid={`problem-card-${i}`}>
                  <span className="icon-badge">
                    <Icon size={22} />
                  </span>
                  <h3 className="title-md">{item.title}</h3>
                  <p className="body-md">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
