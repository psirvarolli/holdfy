"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Independent from the authenticated app's i18n (there isn't one currently)
// — scoped entirely to the public landing page, own localStorage key so it
// never interacts with lib/theme-context.tsx or anything else app-wide.
const STORAGE_KEY = "holdfy-landing-locale";

export type Locale = "pt" | "es" | "en";

interface LandingLocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(null);

export function LandingLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "es" || stored === "en") {
      // window/localStorage não existem no SSR, então isso não pode virar
      // um inicializador preguiçoso do useState.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LandingLocaleContext.Provider value={{ locale, setLocale }}>{children}</LandingLocaleContext.Provider>
  );
}

export function useLandingLocale(): LandingLocaleContextValue {
  const ctx = useContext(LandingLocaleContext);
  if (!ctx) throw new Error("useLandingLocale must be used within a LandingLocaleProvider");
  return ctx;
}
