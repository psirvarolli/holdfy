"use client";

import { useRef, useState } from "react";
import { Camera, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/lib/orders-context";
import type { EvidenceStage, EvidenceType, Order, UserRole } from "@/lib/types";

// Captura de foto/vídeo do produto — vendedor registra a embalagem antes do
// envio, comprador registra o que recebeu. Opcional (não bloqueia o fluxo),
// serve como evidência caso uma disputa seja aberta depois.
export function EvidenceUploader({
  order,
  stage,
  uploadedBy,
}: {
  order: Order;
  stage: EvidenceStage;
  uploadedBy: UserRole;
}) {
  const { addEvidence } = useOrders();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<EvidenceType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = order.evidence.filter((item) => item.stage === stage && item.uploadedBy === uploadedBy);

  async function handleFile(type: EvidenceType, file: File | undefined) {
    if (!file) return;
    setIsUploading(type);
    setError(null);
    try {
      await addEvidence(order.id, file, stage, type, uploadedBy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar o arquivo.");
    } finally {
      setIsUploading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => photoInputRef.current?.click()}
          disabled={isUploading !== null}
        >
          {isUploading === "foto" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
          Tirar Foto
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          disabled={isUploading !== null}
        >
          {isUploading === "video" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Video className="size-4" />
          )}
          Gravar Vídeo
        </Button>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void handleFile("foto", e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void handleFile("video", e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error ? <p className="text-label-sm text-error">{error}</p> : null}

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) =>
            item.type === "foto" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.id}
                src={item.url}
                alt="Evidência enviada"
                className="size-20 rounded-md border border-card-border object-cover"
              />
            ) : (
              <video
                key={item.id}
                src={item.url}
                controls
                className="h-20 rounded-md border border-card-border"
              />
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
