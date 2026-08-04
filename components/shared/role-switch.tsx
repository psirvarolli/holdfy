"use client";

import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

export function RoleSwitch() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-1 rounded-full bg-surface-container-high p-1">
      {(["comprador", "vendedor"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setRole(option)}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-label-sm capitalize transition-colors",
            role === option
              ? "bg-mint-teal text-deep-carbon"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
