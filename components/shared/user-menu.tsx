"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { CircleUser, UserCog, LogOut } from "lucide-react";
import { usePollar } from "@pollar/react";
import { cn } from "@/lib/utils";

function truncateAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function UserMenu({ className }: { className?: string }) {
  const router = useRouter();
  const { wallet, getClient, logout } = usePollar();
  // Perfil (nome/e-mail) só existe em memória após um login nesta aba — pode
  // ser null num retorno de sessão persistida sem novo login.
  const profile = getClient().getUserProfile();

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : wallet
      ? truncateAddress(wallet.address)
      : "Conta";
  const displaySecondary = profile?.mail ?? wallet?.address ?? "";

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Conta"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:text-on-surface",
            className
          )}
        >
          <CircleUser className="size-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-md border border-card-border bg-card p-1 shadow-lg"
        >
          <div className="flex flex-col gap-0.5 px-3 py-2.5">
            <span className="truncate text-body-md font-semibold text-on-surface">
              {displayName}
            </span>
            <span className="truncate text-label-sm text-on-surface-variant">
              {displaySecondary}
            </span>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-outline-variant" />

          <DropdownMenu.Item
            onSelect={() => router.push("/settings")}
            className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-body-md text-on-surface outline-none transition-colors hover:bg-surface-container-high"
          >
            <UserCog className="size-4 text-on-surface-variant" />
            Editar Perfil
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={handleLogout}
            className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-body-md text-error outline-none transition-colors hover:bg-error-container/20"
          >
            <LogOut className="size-4" />
            Sair
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
