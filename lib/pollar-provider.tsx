"use client";

import { PollarProvider as PollarProviderBase, type PollarConfig } from "@pollar/react";
import { PollarClient } from "@pollar/core";
import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme-context";

const POLLAR_CONFIG = { apiKey: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY! };

// Module-level singleton: the SDK warns that constructing a PollarClient per
// render/remount runs independent refresh loops that trip its single-use
// refresh-token rotation and log everyone out. Also skip construction on the
// server — PollarClient needs browser storage APIs.
let browserClient: PollarClient | undefined;

function getPollarClient() {
  if (typeof window === "undefined") return POLLAR_CONFIG;
  if (!browserClient) browserClient = new PollarClient(POLLAR_CONFIG);
  return browserClient;
}

// Local branding override for the login/KYC/wallet modals Pollar renders for
// us. Mirrors the dashboard config (name/network/chains/providers/
// emailEnabled/embeddedWallets) as of 2026-08-05, swapping in the Holdfy
// mark + brand color instead of Pollar's defaults. Passing `appConfig` skips
// Pollar's own remote config fetch entirely (its own doc comment: "used
// verbatim, never merged"), so if the dashboard config is ever changed
// (e.g. enabling GitHub login), this object must be updated to match or the
// change won't show up in the app.
function usePollarAppConfig(): PollarConfig {
  const { theme } = useTheme();
  return {
    application: { name: "Holdfy", network: "testnet", chains: ["STELLAR"] },
    styles: {
      theme,
      accentColor: "#008675",
      logoUrl: theme === "light" ? "/holdfy-icon.svg" : "/holdfy-icon-white.svg",
      emailEnabled: true,
      embeddedWallets: true,
      providers: { google: true, discord: false, x: false, github: false, apple: false },
    },
  };
}

export function PollarProvider({ children }: { children: ReactNode }) {
  const appConfig = usePollarAppConfig();
  return (
    <PollarProviderBase client={getPollarClient()} appConfig={appConfig}>
      {children}
    </PollarProviderBase>
  );
}
