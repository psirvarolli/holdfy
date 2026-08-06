"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRole } from "@/lib/role-context";
import type { Notification, UserRole } from "@/lib/types";

const POLL_INTERVAL_MS = 20_000;

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function fetchNotifications(role: UserRole): Promise<Notification[]> {
  return fetch(`/api/notifications?role=${role}`)
    .then((res) => (res.ok ? res.json() : { notifications: [] }))
    .then((data: { notifications: Notification[] }) => data.notifications ?? []);
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      fetchNotifications(role)
        .then((list) => {
          if (!cancelled) setNotifications(list);
        })
        .catch(() => {
          // silencioso — a próxima rodada de polling tenta de novo
        });
    };
    tick();
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [role]);

  function refresh() {
    fetchNotifications(role)
      .then((list) => setNotifications(list))
      .catch(() => {});
  }

  async function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications/read-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, refresh }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationsProvider");
  return ctx;
}
