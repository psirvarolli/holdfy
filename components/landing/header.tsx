"use client";

import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { MarketingLogo } from "@/components/landing/logo";
import { LanguageSwitcher } from "@/components/landing/language-switcher";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenLead: (source: string) => void;
}

export function Header({ theme, onToggleTheme, onOpenLead }: HeaderProps) {
  const { locale } = useLandingLocale();
  const dict = landingDictionary[locale];
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV = [
    { label: dict.nav.comoFunciona, href: "#como-funciona", testId: "nav-how-it-works" },
    { label: dict.nav.paraQuem, href: "#para-quem", testId: "nav-segments" },
    { label: dict.nav.precos, href: "#precos", testId: "nav-pricing" },
    { label: dict.nav.faq, href: "#faq", testId: "nav-faq" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`} data-testid="site-header">
      <div className="container-hf header-inner">
        <a href="#" className="logo" data-testid="logo-link" aria-label="Holdfy — início">
          <MarketingLogo theme={theme} />
        </a>

        <nav className="header-nav" aria-label="Navegação principal">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} data-testid={item.testId}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />
          <button
            className="icon-btn"
            onClick={onToggleTheme}
            data-testid="theme-toggle-button"
            aria-label={theme === "dark" ? dict.nav.ativarTemaClaro : dict.nav.ativarTemaEscuro}
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button className="btn btn-ghost" onClick={() => onOpenLead("entrar")} data-testid="header-login-link">
            {dict.nav.entrar}
          </button>
          <button className="btn btn-primary" onClick={() => onOpenLead("header")} data-testid="header-cta-button">
            {dict.nav.comecarAgora}
          </button>
          <button
            className="icon-btn mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="mobile-menu-button"
            aria-label={menuOpen ? dict.nav.fecharMenu : dict.nav.abrirMenu}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <nav className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-label="Navegação móvel" data-testid="mobile-menu">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <button
          className="btn btn-primary"
          style={{ marginTop: 12 }}
          onClick={() => {
            setMenuOpen(false);
            onOpenLead("menu-mobile");
          }}
          data-testid="mobile-menu-cta-button"
        >
          {dict.nav.comecarAgora}
        </button>
      </nav>
    </header>
  );
}
