import { prisma } from "@/lib/prisma";
import { resolveOrderId } from "@/lib/server/orders";
import type { EvidenceStage, EvidenceType, UserRole } from "@/lib/types";

// O upload do arquivo em si (foto/vídeo) já aconteceu no navegador, direto
// pro Vercel Blob (arquivos de vídeo passam fácil do limite de 4.5MB de uma
// rota serverless normal — ver lib/evidence-client.ts). Esta função só grava
// o registro no banco depois que o upload terminou e a URL já existe.
export async function addEvidence(
  id: string,
  stage: EvidenceStage,
  type: EvidenceType,
  url: string,
  uploadedBy: UserRole
): Promise<void> {
  const orderId = await resolveOrderId(id);
  if (!orderId) throw new Error("Pedido não encontrado.");

  await prisma.orderEvidence.create({
    data: { orderId, stage, type, url, uploadedBy },
  });
}
