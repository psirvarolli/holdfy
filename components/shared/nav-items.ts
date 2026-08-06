import { LayoutGrid, Receipt, Scale, CreditCard, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/orders", label: "Pedidos", icon: Receipt },
  { href: "/disputes", label: "Disputas", icon: Scale },
  { href: "/plans", label: "Planos", icon: CreditCard },
  { href: "/settings", label: "Configurações", icon: Settings },
] as const;
