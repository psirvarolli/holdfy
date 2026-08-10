"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLandingLocale, type Locale } from "@/lib/landing-locale-context";
import { LANGUAGE_NAMES, LANGUAGE_SHORT_NAMES } from "@/lib/i18n/landing-dictionary";

const LOCALES: Locale[] = ["pt", "es", "en"];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLandingLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        type="button"
        className="lang-switcher-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        data-testid="language-switcher-button"
      >
        <Globe size={16} />
        {LANGUAGE_SHORT_NAMES[locale]}
        <ChevronDown size={14} />
      </button>
      {open && (
        <ul className="lang-switcher-menu" role="listbox" data-testid="language-switcher-menu">
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                className="lang-switcher-option"
                role="option"
                aria-selected={l === locale}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                data-testid={`language-option-${l}`}
              >
                <span className="lang-switcher-check">{l === locale ? <Check size={15} /> : null}</span>
                {LANGUAGE_NAMES[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
