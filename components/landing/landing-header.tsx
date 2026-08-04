"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/landing/language-switcher";
import { Logo } from "@/components/shared/logo";
import { useLocale } from "@/lib/locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

export function LandingHeader() {
  const { locale } = useLocale();
  const { nav } = landingDictionary[locale];

  const navLinks = [
    { href: "#como-funciona", label: nav.comoFunciona },
    { href: "#seguranca", label: nav.seguranca },
    { href: "#para-quem", label: nav.paraQuem },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body-md text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/dashboard">{nav.entrar}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
