import { prisma } from "@/lib/prisma";

export interface CreateLeadInput {
  name: string;
  email: string;
  source: string;
}

export type CreateLeadResult =
  | { status: "created" }
  | { status: "existing" };

// Espelha a rota POST /api/leads do holdfy-site original (FastAPI + Mongo):
// dedupe por e-mail em vez de upsert, sem sobrescrever nome/source de um
// lead que já existe.
export async function createLead(input: CreateLeadInput): Promise<CreateLeadResult> {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.lead.findUnique({ where: { email } });
  if (existing) return { status: "existing" };

  await prisma.lead.create({
    data: { name: input.name.trim(), email, source: input.source },
  });
  return { status: "created" };
}

export async function countLeads(): Promise<number> {
  return prisma.lead.count();
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
}

// Só para o painel /admin/leads — a rota pública /api/leads devolve apenas
// a contagem (usada na faixa de métricas da landing), nunca a lista.
export async function listLeads(): Promise<Lead[]> {
  const rows = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  }));
}
