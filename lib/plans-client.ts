"use client";

import { useEffect, useState } from "react";
import { usePollar } from "@pollar/react";
import type { Plan, SellerPlanStatus } from "@/lib/types";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data: { plans: Plan[] }) => {
        if (!cancelled) setPlans(data.plans ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { plans, isLoading };
}

// Situação do plano do vendedor atualmente conectado (pela carteira Pollar).
// Sem carteira ainda carregada, devolve null — quem usa decide o que mostrar
// nesse meio-tempo. `isLoading` é derivado (não guardado em state) pra nunca
// precisar de um setState síncrono direto no corpo do efeito — só dentro dos
// callbacks de `.then()`/`.catch()`, que rodam depois, de forma assíncrona.
export function useSellerPlanStatus() {
  const { wallet } = usePollar();
  const address = wallet?.address;
  const [status, setStatus] = useState<SellerPlanStatus | null>(null);
  const [loadedForAddress, setLoadedForAddress] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    // sellerAddress não vai mais na URL — o servidor deriva da sessão de
    // carteira (cookie); `address` aqui só decide quando buscar/re-buscar.
    fetch("/api/plans/status")
      .then((res) => res.json())
      .then((data: { status: SellerPlanStatus }) => {
        if (cancelled) return;
        setStatus(data.status);
        setLoadedForAddress(address);
      })
      .catch(() => {
        if (!cancelled) setLoadedForAddress(address);
      });
    return () => {
      cancelled = true;
    };
  }, [address, refreshCount]);

  return {
    status,
    isLoading: !!address && loadedForAddress !== address,
    refresh: () => {
      setLoadedForAddress(null);
      setRefreshCount((n) => n + 1);
    },
  };
}

export async function subscribeToPro(): Promise<string> {
  const res = await fetch("/api/plans/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planSlug: "pro" }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? "Falha ao iniciar a assinatura.");
  }
  return data.url;
}
