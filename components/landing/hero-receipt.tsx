"use client";

import { useEffect, useState } from "react";
import { ReceiptFrame } from "@/components/landing/receipt-frame";
import { WaxSeal } from "@/components/landing/wax-seal";

interface HeroReceiptProps {
  orderId: string;
  itemName: string;
  value: string;
  waitingLabel: string;
  sealedLabel: string;
  className?: string;
}

/**
 * The hero's thesis in one object: a real transaction on a real receipt,
 * with the seal physically stamping down once custody is "confirmed" —
 * replacing a generic H1+subtitle+button hero per the brief.
 */
export function HeroReceipt({ orderId, itemName, value, waitingLabel, sealedLabel, className }: HeroReceiptProps) {
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSealed(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ReceiptFrame className={className}>
      <div className="flex flex-col gap-4">
        <span className="font-mono text-label-sm uppercase tracking-wide opacity-60">{orderId}</span>
        <p className="text-body-lg font-semibold">{itemName}</p>
        <p className="font-mono text-headline-md">{value}</p>
        <hr className="holdfy-receipt-divider" />
        <div className="flex items-center justify-between gap-4">
          <span className="text-label-sm uppercase tracking-wide opacity-70">{waitingLabel}</span>
          {sealed ? (
            <WaxSeal state="retido" label={sealedLabel} />
          ) : (
            <div
              className="size-[4.5rem] shrink-0 rounded-full border border-dashed border-current opacity-25"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </ReceiptFrame>
  );
}
