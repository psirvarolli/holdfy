"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { UserRole } from "@/lib/types";

const STORAGE_KEY = "holdfy-role";

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("comprador");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "comprador" || stored === "vendedor") {
      setRoleState(stored);
    }
  }, []);

  function setRole(next: UserRole) {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  function toggleRole() {
    setRole(role === "comprador" ? "vendedor" : "comprador");
  }

  return (
    <RoleContext.Provider value={{ role, setRole, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
