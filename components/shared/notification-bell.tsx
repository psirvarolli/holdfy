"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "@/lib/notifications-context";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  function handleSelect(notification: Notification) {
    if (!notification.read) markAsRead(notification.id);
    router.push(`/orders/${notification.orderId}`);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : "Notificações"}
          className={cn(
            "relative flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:text-on-surface",
            className
          )}
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex size-2 items-center justify-center rounded-full bg-error" />
          ) : null}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 flex max-h-96 w-80 flex-col overflow-hidden rounded-md border border-card-border bg-card shadow-lg"
        >
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-body-md font-semibold text-on-surface">Notificações</span>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-label-sm text-primary hover:underline"
              >
                <CheckCheck className="size-3.5" />
                Marcar todas como lidas
              </button>
            ) : null}
          </div>

          <DropdownMenu.Separator className="h-px bg-outline-variant" />

          <div className="flex flex-col overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-body-md text-on-surface-variant">
                Nenhuma notificação ainda.
              </p>
            ) : (
              notifications.map((notification) => (
                <DropdownMenu.Item
                  key={notification.id}
                  onSelect={() => handleSelect(notification)}
                  className={cn(
                    "flex cursor-pointer flex-col gap-0.5 px-3 py-2.5 text-body-md outline-none transition-colors hover:bg-surface-container-high",
                    !notification.read && "bg-mint-teal/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!notification.read ? (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    ) : (
                      <span className="mt-1.5 size-1.5 shrink-0" />
                    )}
                    <span className="text-on-surface">{notification.message}</span>
                  </div>
                  <span className="pl-3.5 text-label-sm text-on-surface-variant">
                    {formatDate(notification.createdAt)}
                  </span>
                </DropdownMenu.Item>
              ))
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
