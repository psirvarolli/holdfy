import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { z } from "zod";
import { evidenceType } from "@/lib/server/validation";
import { getOrder } from "@/lib/server/orders";
import { getSessionAddress } from "@/lib/server/wallet-session";

const PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const clientPayloadSchema = z.object({ type: evidenceType });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const order = await getOrder(id);
  if (!order || (order.sellerAddress !== address && order.buyerAddress !== address)) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const parsed = clientPayloadSchema.safeParse(JSON.parse(clientPayload ?? "{}"));
        if (!parsed.success) {
          throw new Error("Tipo de evidência inválido.");
        }

        return {
          allowedContentTypes:
            parsed.data.type === "foto" ? PHOTO_CONTENT_TYPES : VIDEO_CONTENT_TYPES,
          maximumSizeInBytes: parsed.data.type === "foto" ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // O registro no banco é criado explicitamente pelo cliente logo após
        // o upload terminar (ver lib/evidence-client.ts), não por aqui — esse
        // webhook não funciona em ambiente local (localhost não é alcançável
        // pelo Vercel Blob), então não pode ser o único caminho.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao autorizar o upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
