import { LayoutGrid, Receipt, Scale, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/orders", label: "Pedidos", icon: Receipt },
  { href: "/disputes", label: "Disputas", icon: Scale },
  { href: "/settings", label: "Configurações", icon: Settings },
] as const;
