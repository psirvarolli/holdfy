"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "@/components/landing/social-icons";
import { MarketingLogo } from "@/components/landing/logo";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

// Contact values/hrefs and social links aren't language-dependent (real
// data, not copy) — only the labels come from the dictionary.
const CONTACT_META = [
  { icon: Mail, value: "contato@holdfy.com.br", href: "mailto:contato@holdfy.com.br" },
  { icon: Phone, value: "+55 (11) 98395-2506", href: "tel:+5511983952506" },
  { icon: MapPin, value: "Avenida Paulista, 777 - São Paulo" },
];

const SOCIAL = [
  { icon: LinkedinIcon, label: "LinkedIn", testId: "social-linkedin" },
  { icon: InstagramIcon, label: "Instagram", testId: "social-instagram" },
  { icon: YoutubeIcon, label: "YouTube", testId: "social-youtube" },
  { icon: GithubIcon, label: "GitHub", testId: "social-github" },
];

export function Footer({ theme }: { theme: "light" | "dark" }) {
  const { locale } = useLandingLocale();
  const { footer } = landingDictionary[locale];
  const CONTACT = [
    { ...CONTACT_META[0], label: footer.contact.emailLabel },
    { ...CONTACT_META[1], label: footer.contact.phoneLabel },
    { ...CONTACT_META[2], label: footer.contact.addressLabel },
  ];

  return (
    <footer className="site-footer" data-testid="site-footer">
      <div className="container-hf">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="logo" aria-label="Holdfy — início">
              <MarketingLogo theme={theme} />
            </a>
            <p>{footer.tagline}</p>
            <div className="footer-social">
              {SOCIAL.map((s) => (
                <a key={s.label} href="#" className="icon-btn" aria-label={s.label} data-testid={s.testId}>
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>
          {footer.columns.map((col) => (
            <div className="footer-col" key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer-col" data-testid="footer-contact">
            <h4>{footer.contact.title}</h4>
            <div className="footer-contact-list">
              {CONTACT.map((item) => {
                const content = (
                  <>
                    <span className="icon-badge">
                      <item.icon size={18} />
                    </span>
                    <span>
                      <span className="footer-contact-label">{item.label}</span>
                      <span className="footer-contact-value">{item.value}</span>
                    </span>
                  </>
                );
                return (
                  <div className="footer-contact-item" key={item.label}>
                    {item.href ? (
                      <a href={item.href} className="footer-contact-link">
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-compliance">{footer.compliance}</p>
          <p className="footer-copy">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
