"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/shared/nav-items";
import { Logo } from "@/components/shared/logo";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 overflow-y-auto border-r border-outline-variant bg-surface-container-low p-6 md:flex">
      <Logo />

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.filter((item) => !item.sellerOnly || role === "vendedor").map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-body-md transition-colors",
                active
                  ? "bg-mint-teal/15 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
