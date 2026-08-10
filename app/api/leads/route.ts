import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead, countLeads } from "@/lib/server/leads";
import { parseJsonBody } from "@/lib/server/validation";

export async function GET() {
  const count = await countLeads();
  return NextResponse.json({ count });
}

const newLeadSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email("E-mail inválido.").max(200),
  source: z.string().trim().max(60).optional().default("landing"),
});

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, newLeadSchema);
  if ("error" in parsed) return parsed.error;

  const result = await createLead(parsed.data);
  if (result.status === "existing") {
    return NextResponse.json({ status: "existing", message: "Este e-mail já está na lista." });
  }
  return NextResponse.json({ status: "created", message: "Cadastro realizado com sucesso." }, { status: 201 });
}
