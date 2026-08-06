"use client";

import { useEffect, useState } from "react";

// Prévia de conversão R$ -> USDC para exibir antes do pagamento. O valor que
// realmente é cobrado é convertido de novo (e travado) no servidor, no
// momento do pagamento — isto aqui é só pra o comprador saber, com
// antecedência, aproximadamente quanto USDC vai precisar.
export function useBrlToUsdcPreview(brlAmount: number) {
  const [result, setResult] = useState<{ forAmount: number; usdc: number | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/fx/convert?brl=${brlAmount}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setResult({ forAmount: brlAmount, usdc: typeof data.usdc === "number" ? data.usdc : null });
        }
      })
      .catch(() => {
        if (!cancelled) setResult({ forAmount: brlAmount, usdc: null });
      });
    return () => {
      cancelled = true;
    };
  }, [brlAmount]);

  const isCurrent = result?.forAmount === brlAmount;
  return {
    usdc: isCurrent ? result!.usdc : null,
    isLoading: !isCurrent,
  };
}
