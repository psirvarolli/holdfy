"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Disputas", href: "/admin/disputes" },
  { label: "Lista de Espera", href: "/admin/leads" },
];

export function AdminTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant bg-surface px-4 py-4 md:px-8">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Logo className="h-6" />
          <span className="text-label-sm text-on-surface-variant">Painel</span>
        </div>
        <nav className="flex items-center gap-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-label-md text-on-surface-variant hover:text-on-surface",
                pathname?.startsWith(item.href) && "text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="size-4" />
        Sair
      </Button>
    </header>
  );
}
