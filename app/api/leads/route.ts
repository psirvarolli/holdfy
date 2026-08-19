import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead, countLeads } from "@/lib/server/leads";
import { parseJsonBody } from "@/lib/server/validation";
import { isRateLimited } from "@/lib/server/rate-limit";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos

export async function GET() {
  const count = await countLeads();
  return NextResponse.json({ count });
}

const newLeadSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email("E-mail inválido.").max(200),
  source: z.string().trim().max(60).optional().default("landing"),
});

// Rota pública de propósito (captura de lead na landing page, sem login) —
// mas sem limite nenhum dava pra automatizar spam na lista de e-mails ou
// varrer quais e-mails já estão cadastrados (a resposta distingue
// "existing" de "created"). Mesmo limitador já usado em /api/admin/login e
// /api/auth/*, agora também aqui.
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await isRateLimited(`leads:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo." },
      { status: 429 }
    );
  }

  const parsed = await parseJsonBody(request, newLeadSchema);
  if ("error" in parsed) return parsed.error;

  const result = await createLead(parsed.data);
  if (result.status === "existing") {
    return NextResponse.json({ status: "existing", message: "Este e-mail já está na lista." });
  }
  return NextResponse.json({ status: "created", message: "Cadastro realizado com sucesso." }, { status: 201 });
}
