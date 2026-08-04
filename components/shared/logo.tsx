"use client";

import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const { theme } = useTheme();
  const src = theme === "light" ? "/holdfy-logo.svg" : "/holdfy-logo-white.svg";

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="Holdfy" className={cn("h-7 w-auto", className)} />;
}
