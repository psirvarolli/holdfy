import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EscrowCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string;
  helperText?: string;
  helperClassName?: string;
  className?: string;
}

export function EscrowCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  helperText,
  helperClassName,
  className,
}: EscrowCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-full bg-mint-teal/15 text-primary",
          iconClassName
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-label-sm uppercase text-on-surface-variant">{label}</span>
        <span className="text-headline-md text-on-surface">{value}</span>
        {helperText ? (
          <span className={cn("text-label-sm text-on-surface-variant", helperClassName)}>
            {helperText}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
