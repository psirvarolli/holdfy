import { upload } from "@vercel/blob/client";
import type { EvidenceStage, EvidenceType, Order, UserRole } from "@/lib/types";

// Acesso "public": o link do arquivo funciona direto num <img>/<video> sem
// precisar gerar URL assinada — evidência de embalagem/recebimento não é
// dado sensível a ponto de justificar a complexidade extra de acesso privado.
export async function uploadEvidence(
  orderId: string,
  file: File,
  stage: EvidenceStage,
  type: EvidenceType,
  uploadedBy: UserRole
): Promise<Order> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: `/api/orders/${orderId}/evidence/upload`,
    clientPayload: JSON.stringify({ type }),
  });

  const res = await fetch(`/api/orders/${orderId}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage, type, url: blob.url, uploadedBy }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Falha ao registrar a evidência.");
  }

  const data: { order: Order } = await res.json();
  return data.order;
}
