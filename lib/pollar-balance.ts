"use client";

import { useEffect } from "react";
import { usePollar } from "@pollar/react";

// Saldo de USDC da carteira Pollar de quem está logado — usado tanto para
// decidir se falta comprar mais via Pix antes de pagar um pedido quanto
// para exibir o saldo em Configurações.
export function useUsdcBalance() {
  const { walletBalance, refreshWalletBalance } = usePollar();

  useEffect(() => {
    refreshWalletBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const record = walletBalance.step === "loaded" ? walletBalance.data.balances.find((b) => b.code === "USDC") : undefined;

  return {
    isLoading: walletBalance.step === "loading" || walletBalance.step === "idle",
    available: record?.available ? Number(record.available) : 0,
    refresh: refreshWalletBalance,
  };
}
