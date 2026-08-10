"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

export function Faq() {
  const { locale } = useLandingLocale();
  const { faq } = landingDictionary[locale];
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section" data-testid="faq-section">
      <div className="container-hf">
        <Reveal>
          <div className="section-head center">
            <span className="chip">{faq.eyebrow}</span>
            <h2 className="headline-lg">{faq.title}</h2>
          </div>
        </Reveal>
        <div className="faq-list">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 60}>
                <div className={`faq-item ${isOpen ? "open" : ""}`} data-testid={`faq-item-${i}`}>
                  <button
                    className="faq-question"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    data-testid={`faq-question-${i}`}
                  >
                    {item.q}
                    <ChevronDown size={19} />
                  </button>
                  <div className="faq-answer">
                    <div>
                      <p data-testid={`faq-answer-${i}`}>{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
