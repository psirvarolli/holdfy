"use client";

import { useEffect, useState } from "react";
import { usePollar } from "@pollar/react";

export interface SellerProfileData {
  sellerAddress: string;
  monthlyRevenueReais: number;
}

// Mesmo padrão de useSellerWhatsapp (lib/seller-whatsapp-client.ts).
export function useSellerProfile() {
  const { wallet } = usePollar();
  const address = wallet?.address;
  const [profile, setProfile] = useState<SellerProfileData | null>(null);
  const [loadedForAddress, setLoadedForAddress] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    fetch("/api/seller/profile")
      .then((res) => res.json())
      .then((data: { profile: SellerProfileData | null }) => {
        if (cancelled) return;
        setProfile(data.profile);
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
    profile,
    isLoading: !!address && loadedForAddress !== address,
    refresh: () => {
      setLoadedForAddress(null);
      setRefreshCount((n) => n + 1);
    },
  };
}

export async function saveMonthlyRevenue(monthlyRevenueReais: number): Promise<SellerProfileData> {
  const res = await fetch("/api/seller/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monthlyRevenueReais }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw new Error(data?.error ?? `Falha ao salvar o faturamento (HTTP ${res.status}). Tente novamente.`);
  }
  return data.profile;
}
