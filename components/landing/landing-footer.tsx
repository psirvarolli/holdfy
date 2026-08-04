"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";
import { Logo } from "@/components/shared/logo";

const FOOTER_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Pedidos" },
  { href: "/disputes", label: "Disputas" },
  { href: "/settings", label: "Configurações" },
];

export function LandingFooter() {
  const { locale } = useLocale();
  const { footer } = landingDictionary[locale];

  return (
    <footer className="border-t border-outline-variant">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-label-sm text-on-surface-variant">{footer.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-label-sm text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-label-sm text-on-surface-variant">{footer.copyright}</p>
      </div>
    </footer>
  );
}
