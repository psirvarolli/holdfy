import Link from "next/link";
import { Store } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";

interface OrderRowProps {
  order: Order;
  href: string;
  className?: string;
}

export function OrderRow({ order, href, className }: OrderRowProps) {
  const isDisputed = order.status === "em_disputa";

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md border border-transparent p-3 transition-colors hover:bg-surface-container-high",
        isDisputed && "border-error/40 bg-error-container/10",
        className
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
        <Store className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-body-md text-on-surface">{order.counterpartyName}</span>
        <span className="truncate text-label-sm text-on-surface-variant">
          Pedido {order.displayId} • {formatDate(order.createdAt)}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-body-md text-on-surface">{formatCurrency(order.total)}</span>
        <StatusBadge status={order.status} size="sm" />
      </div>
    </Link>
  );
}
