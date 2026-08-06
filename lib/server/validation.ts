import "server-only";
import { NextResponse } from "next/server";
import { z, type ZodType } from "zod";

// Endereço público Stellar: começa com "G", 56 caracteres, alfabeto base32.
export const stellarAddress = z
  .string()
  .regex(/^G[A-Z2-7]{55}$/, "Endereço de carteira Stellar inválido.");

export const userRole = z.enum(["comprador", "vendedor"]);

export const evidenceStage = z.enum(["envio", "recebimento"]);
export const evidenceType = z.enum(["foto", "video"]);

export const planSlug = z.enum(["starter", "pro", "enterprise"]);

// Reais (R$) — usado tanto para preços de pedido quanto para distribuição de
// disputa. Zero é permitido só onde faz sentido (ex: frete grátis), então
// cada rota decide entre `.nonnegative()` e `.positive()`.
export const money = z.number().finite();

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<{ data: T } | { error: NextResponse }> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { error: NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 }) };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Dados inválidos.";
    return { error: NextResponse.json({ error: message }, { status: 400 }) };
  }
  return { data: result.data };
}
