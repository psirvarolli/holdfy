import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-full w-fit",
  {
    variants: {
      variant: {
        mint: "bg-mint-teal/15 text-primary border border-mint-teal/30",
        error: "bg-error-container/40 text-error border border-error/30",
        tertiary:
          "bg-tertiary-container/30 text-tertiary border border-tertiary/30",
        neutral:
          "bg-secondary-container text-on-secondary-container border border-outline-variant",
      },
      size: {
        default: "gap-1.5 px-3 py-1 text-label-sm [&_svg]:size-3.5",
        sm: "gap-1 px-2 py-0.5 text-[11px] font-medium tracking-wide [&_svg]:size-3",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}

export { Badge, badgeVariants };
