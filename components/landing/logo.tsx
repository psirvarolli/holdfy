import { cn } from "@/lib/utils";

interface MarketingLogoProps {
  theme: "light" | "dark";
  className?: string;
}

// The landing page has its own independent theme (see app/page.tsx), so this
// can't reuse components/shared/logo.tsx, which reads the authenticated
// app's ThemeProvider via useTheme() — a different, unrelated theme state.
export function MarketingLogo({ theme, className }: MarketingLogoProps) {
  const src = theme === "light" ? "/holdfy-logo.svg" : "/holdfy-logo-white.svg";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="Holdfy" className={cn("h-7 w-auto", className)} />;
}
