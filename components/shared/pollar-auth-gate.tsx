"use client";

import { usePollar } from "@pollar/react";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnsureWalletSession } from "@/lib/wallet-session-client";

export function PollarAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, openLoginModal } = usePollar();
  useEnsureWalletSession();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <Logo className="h-8" />
          <CardHeader className="items-center gap-2 p-0">
            <CardTitle>Entre para continuar</CardTitle>
            <CardDescription>
              Sua conta e carteira Stellar são criadas automaticamente — sem senhas, sem frases
              de recuperação.
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full p-0">
            <Button className="w-full" size="lg" onClick={openLoginModal}>
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
