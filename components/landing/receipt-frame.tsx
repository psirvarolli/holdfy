import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ReceiptFrameProps {
  children: ReactNode;
  className?: string;
  /** CSS color matching the parent section's background, so the punched
   * side-notches read as real cutouts instead of floating grey dots. */
  notchBg?: string;
}

export function ReceiptFrame({ children, className, notchBg = "var(--color-surface)" }: ReceiptFrameProps) {
  return (
    <div
      className={cn("holdfy-receipt-frame p-6", className)}
      style={{ "--holdfy-receipt-notch-bg": notchBg } as CSSProperties}
    >
      {children}
    </div>
  );
}
