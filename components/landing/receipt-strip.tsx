import { ReceiptFrame } from "@/components/landing/receipt-frame";

interface ReceiptStripStep {
  title: string;
  description: string;
}

interface ReceiptStripProps {
  steps: ReceiptStripStep[];
  notchBg?: string;
}

/**
 * "Como funciona" as one torn ticket strip instead of three icon+title+
 * paragraph cards — the numbering here is a genuine sequence (pay → ship →
 * release), so it's kept, but framed as receipt line items, not a generic
 * feature grid.
 */
export function ReceiptStrip({ steps, notchBg }: ReceiptStripProps) {
  return (
    <ReceiptFrame notchBg={notchBg} className="p-0">
      <div className="grid divide-y divide-dashed divide-current/25 md:grid-cols-3 md:divide-x md:divide-y-0">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col gap-3 p-6">
            <span className="font-mono text-label-sm opacity-50">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="text-body-lg font-semibold">{step.title}</h3>
            <p className="text-body-md opacity-70">{step.description}</p>
          </div>
        ))}
      </div>
    </ReceiptFrame>
  );
}
