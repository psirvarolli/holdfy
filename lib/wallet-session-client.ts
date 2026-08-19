"use client";

import { useEffect, useRef } from "react";
import { usePollar } from "@pollar/react";

// Estabelece a sessão de servidor (cookie holdfy_wallet_session) via SEP-10
// assim que a Pollar confirma que o usuário está logado — transparente, sem
// UI própria. Enquanto isso não roda (ou falha), as rotas que exigem sessão
// (ver lib/server/wallet-session.ts) simplesmente recusam com 401; não há um
// estado de erro dedicado aqui de propósito, porque isso deveria ser
// invisível na grande maioria das vezes.
export function useEnsureWalletSession(): void {
  const { wallet, isAuthenticated, verified, getClient } = usePollar();
  const establishedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !verified || !wallet?.address) return;
    if (establishedFor.current === wallet.address) return;

    let cancelled = false;
    const address = wallet.address;

    (async () => {
      const challengeRes = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      if (!challengeRes.ok) return;
      const { challengeXdr, homeDomain } = (await challengeRes.json()) as {
        challengeXdr: string;
        homeDomain: string;
      };

      const proof = await getClient().stellar.sep10.sign({ challengeXdr, homeDomains: homeDomain });
      if (proof.status !== "signed" || cancelled) return;

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr: proof.signedXdr }),
      });
      if (!cancelled && verifyRes.ok) {
        establishedFor.current = address;
      }
    })().catch(() => {
      // Ver comentário no topo do arquivo — falha aqui não tem UI própria.
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, verified, wallet?.address, getClient]);
}
