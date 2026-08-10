"use client";

import { Briefcase, Building2, Handshake, Store } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

const ICONS = [Briefcase, Store, Building2, Handshake];

export function Segments() {
  const { locale } = useLandingLocale();
  const { segments } = landingDictionary[locale];

  return (
    <section id="para-quem" className="section section-alt" data-testid="segments-section">
      <div className="container-hf">
        <Reveal>
          <div className="section-head center">
            <span className="chip">{segments.eyebrow}</span>
            <h2 className="headline-lg">{segments.title}</h2>
            <p className="body-md">{segments.subtitle}</p>
          </div>
        </Reveal>
        <div className="grid-4">
          {segments.items.map((seg, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={seg.title} delay={i * 100}>
                <div className="card segment-card" data-testid={`segment-card-${i}`}>
                  <span className="icon-badge">
                    <Icon size={22} />
                  </span>
                  <h3 className="title-md">{seg.title}</h3>
                  <p>{seg.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
