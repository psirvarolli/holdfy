import "server-only";
import { prisma } from "@/lib/prisma";

// Persistido no Postgres (não num Map em memória) porque a Vercel roda
// funções serverless — cada instância teria seu próprio contador, então a
// versão anterior não limitava nada de verdade em produção (ver auditoria de
// mainnet). O UPSERT abaixo é uma única instrução atômica: se a janela
// (`resetAt`) já passou, reseta pra 1; senão incrementa — sem race condition
// entre chamadas concorrentes de instâncias diferentes.
export async function isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const resetAt = new Date(Date.now() + windowMs);
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" < now() THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" < now() THEN ${resetAt} ELSE "RateLimitBucket"."resetAt" END
    RETURNING "count"
  `;
  return rows[0].count > limit;
}
