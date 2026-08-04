"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLocale, type Locale } from "@/lib/locale-context";
import { LANGUAGE_NAMES } from "@/lib/i18n/landing-dictionary";
import { cn } from "@/lib/utils";

const LOCALES: Locale[] = ["pt", "es", "en"];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-2 text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Globe className="size-4 text-on-surface-variant" />
          {LANGUAGE_NAMES[locale]}
          <ChevronDown className="size-3.5 text-on-surface-variant" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-40 rounded-md border border-card-border bg-card p-1 shadow-lg"
        >
          {LOCALES.map((option) => (
            <DropdownMenu.Item
              key={option}
              onSelect={() => setLocale(option)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-body-md text-on-surface outline-none transition-colors hover:bg-surface-container-high",
                option === locale && "text-primary"
              )}
            >
              {LANGUAGE_NAMES[option]}
              {option === locale ? <Check className="size-4" /> : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
