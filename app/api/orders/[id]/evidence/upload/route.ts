import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { z } from "zod";
import { evidenceType } from "@/lib/server/validation";

const PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const clientPayloadSchema = z.object({ type: evidenceType });

export async function POST(request: Request) {
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
