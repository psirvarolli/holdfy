"use client";

import { useEffect, useState } from "react";
import { usePollar } from "@pollar/react";

export interface SellerWhatsappLink {
  sellerAddress: string;
  phone: string;
}

// Mesmo padrão de useSellerPlanStatus (lib/plans-client.ts): null enquanto a
// carteira Pollar ainda não carregou ou a consulta está em andamento.
export function useSellerWhatsapp() {
  const { wallet } = usePollar();
  const address = wallet?.address;
  const [link, setLink] = useState<SellerWhatsappLink | null>(null);
  const [loadedForAddress, setLoadedForAddress] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    fetch(`/api/seller/whatsapp?sellerAddress=${encodeURIComponent(address)}`)
      .then((res) => res.json())
      .then((data: { link: SellerWhatsappLink | null }) => {
        if (cancelled) return;
        setLink(data.link);
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
    link,
    isLoading: !!address && loadedForAddress !== address,
    refresh: () => {
      setLoadedForAddress(null);
      setRefreshCount((n) => n + 1);
    },
  };
}

export async function linkSellerWhatsapp(sellerAddress: string, phone: string): Promise<SellerWhatsappLink> {
  const res = await fetch("/api/seller/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sellerAddress, phone }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw new Error(data?.error ?? `Falha ao vincular o WhatsApp (HTTP ${res.status}). Tente novamente.`);
  }
  return data.link;
}

export async function unlinkSellerWhatsapp(sellerAddress: string): Promise<void> {
  const res = await fetch("/api/seller/whatsapp", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sellerAddress }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Falha ao desvincular o WhatsApp.");
  }
}
