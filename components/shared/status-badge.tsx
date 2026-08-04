import { Shield, CheckCircle2, Gavel, Clock, Truck } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; variant: BadgeProps["variant"] }
> = {
  pago_custodia: { label: "Pago em Custódia", icon: Shield, variant: "mint" },
  concluido: { label: "Concluído", icon: CheckCircle2, variant: "mint" },
  liberado: { label: "Liberado", icon: CheckCircle2, variant: "mint" },
  retido: { label: "Retido", icon: Clock, variant: "tertiary" },
  em_transito: { label: "Em Trânsito", icon: Truck, variant: "neutral" },
  em_disputa: { label: "Em Disputa", icon: Gavel, variant: "error" },
};

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: OrderStatus;
  label?: string;
}

export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className={cn(className)} {...props}>
      <Icon />
      {label ?? config.label}
    </Badge>
  );
}
