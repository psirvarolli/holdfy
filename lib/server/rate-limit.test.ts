import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "./rate-limit";

// Usa o Postgres local de verdade (mesmo banco do `npm run dev`) em vez de
// mockar o Prisma: o que está sendo testado aqui é justamente se o UPSERT
// atômico se comporta certo sob concorrência — um mock não pegaria uma
// condição de corrida real na expressão CASE do SQL.
beforeEach(async () => {
  await prisma.rateLimitBucket.deleteMany({ where: { key: { startsWith: "teste:" } } });
});

afterAll(async () => {
  await prisma.rateLimitBucket.deleteMany({ where: { key: { startsWith: "teste:" } } });
  await prisma.$disconnect();
});

describe("isRateLimited", () => {
  it("permite requisições dentro do limite", async () => {
    const key = "teste:dentro-do-limite";
    for (let i = 0; i < 5; i++) {
      expect(await isRateLimited(key, 5, 60_000)).toBe(false);
    }
  });

  it("bloqueia a partir da requisição que excede o limite", async () => {
    const key = "teste:excede-limite";
    for (let i = 0; i < 5; i++) {
      await isRateLimited(key, 5, 60_000);
    }
    expect(await isRateLimited(key, 5, 60_000)).toBe(true);
  });

  it("chaves diferentes não interferem uma na outra", async () => {
    for (let i = 0; i < 5; i++) {
      await isRateLimited("teste:chave-a", 5, 60_000);
    }
    // "chave-a" já estourou o limite, mas "chave-b" começa do zero.
    expect(await isRateLimited("teste:chave-b", 5, 60_000)).toBe(false);
  });

  it("libera de novo depois que a janela de tempo passa", async () => {
    const key = "teste:janela-expira";
    // Janela de 1ms — a próxima chamada já vai encontrar "resetAt" no
    // passado e resetar o contador, sem precisar de fake timers (a lógica
    // de expiração roda dentro do SQL, comparando com now() do próprio
    // Postgres, não com Date.now() do processo Node).
    await isRateLimited(key, 1, 1);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(await isRateLimited(key, 1, 60_000)).toBe(false);
  });

  it("concorrência: N chamadas simultâneas nunca deixam passar mais que o limite", async () => {
    const key = "teste:concorrencia";
    const limit = 10;
    const results = await Promise.all(
      Array.from({ length: 20 }, () => isRateLimited(key, limit, 60_000))
    );
    const allowed = results.filter((blocked) => !blocked).length;
    expect(allowed).toBe(limit);
  });
});
