import { Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Order, OrderEvidence } from "@/lib/types";

const STAGE_LABEL = { envio: "Envio (vendedor)", recebimento: "Recebimento (comprador)" } as const;

function EvidenceItem({ item }: { item: OrderEvidence }) {
  if (item.type === "foto") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt="Evidência enviada"
        className="size-24 rounded-md border border-card-border object-cover"
      />
    );
  }
  return <video src={item.url} controls className="h-24 rounded-md border border-card-border" />;
}

export function EvidenceGallery({ order }: { order: Order }) {
  if (order.evidence.length === 0) return null;

  const envio = order.evidence.filter((item) => item.stage === "envio");
  const recebimento = order.evidence.filter((item) => item.stage === "recebimento");

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-on-surface">
        <Camera className="size-5" />
        <h2 className="text-body-lg font-semibold">Evidências</h2>
      </div>

      {(
        [
          ["envio", envio],
          ["recebimento", recebimento],
        ] as const
      ).map(([stage, items]) =>
        items.length > 0 ? (
          <div key={stage} className="flex flex-col gap-2">
            <span className="text-label-sm uppercase text-on-surface-variant">
              {STAGE_LABEL[stage]}
            </span>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <EvidenceItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : null
      )}
    </Card>
  );
}
