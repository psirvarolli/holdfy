import type { ReactNode } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { PollarAuthGate } from "@/components/shared/pollar-auth-gate";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <PollarAuthGate>
      <AppShell>{children}</AppShell>
    </PollarAuthGate>
  );
}
