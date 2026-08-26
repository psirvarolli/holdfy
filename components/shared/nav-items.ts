import { LayoutGrid, Receipt, Scale, CreditCard, Settings } from "lucide-react";

// Planos só faz sentido pro vendedor — é ele quem paga a taxa e assina um
// plano; o comprador que cai lá só via a mensagem "troque para vendedor" (a
// própria tela ainda trata esse caso, mas o link nem aparece mais no menu).
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, sellerOnly: false },
  { href: "/orders", label: "Pedidos", icon: Receipt, sellerOnly: false },
  { href: "/disputes", label: "Disputas", icon: Scale, sellerOnly: false },
  { href: "/plans", label: "Planos", icon: CreditCard, sellerOnly: true },
  { href: "/settings", label: "Configurações", icon: Settings, sellerOnly: false },
] as const;
