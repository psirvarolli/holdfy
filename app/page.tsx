"use client";

import { useCallback, useEffect, useState } from "react";
import { Toaster } from "sonner";
import "./marketing.css";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Segments } from "@/components/landing/segments";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { LeadModal } from "@/components/landing/lead-modal";
import { LandingLocaleProvider, useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

// Tema desta página é independente do tema do app autenticado (chave de
// localStorage diferente de lib/theme-context.tsx) — a landing é "Holdfy
// Modern Fintech" (claro por padrão), o app logado continua "Conversational
// Vault" (escuro por padrão). Ver comentário em app/marketing.css.
const LANDING_THEME_KEY = "holdfy-landing-theme";

function LandingPageContent() {
  const { locale } = useLandingLocale();
  const dict = landingDictionary[locale];

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSource, setLeadSource] = useState("geral");

  useEffect(() => {
    const stored = window.localStorage.getItem(LANDING_THEME_KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANDING_THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.title = dict.meta.title;
  }, [dict.meta.title]);

  const openLead = useCallback((source: string = "geral") => {
    setLeadSource(source);
    setLeadOpen(true);
  }, []);

  return (
    <div className={`holdfy-marketing ${theme === "dark" ? "dark" : ""}`}>
      <Header theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} onOpenLead={openLead} />
      <main>
        <Hero onOpenLead={openLead} />
        <Problem />
        <HowItWorks />
        <Segments />
        <Pricing onOpenLead={openLead} />
        <Faq />
        <FinalCta onOpenLead={openLead} />
      </main>
      <Footer theme={theme} />
      <LeadModal open={leadOpen} source={leadSource} onClose={() => setLeadOpen(false)} />
      <Toaster position="top-center" richColors closeButton theme={theme} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <LandingLocaleProvider>
      <LandingPageContent />
    </LandingLocaleProvider>
  );
}
