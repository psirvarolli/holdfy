"use client";

import { useRole } from "@/lib/role-context";
import { BuyerDashboard } from "@/components/buyer/buyer-dashboard";
import { SellerDashboard } from "@/components/seller/seller-dashboard";

export default function DashboardPage() {
  const { role } = useRole();
  return role === "comprador" ? <BuyerDashboard /> : <SellerDashboard />;
}
