import { describe, it, expect, vi, beforeEach } from "vitest";

// `fx-rate.ts` guarda a cotação num cache em memória no nível do módulo —
// reimporta com `vi.resetModules()` em cada teste para começar sem cache.
beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

function mockFetchOnce(rate: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ amount: 1, base: "USD", date: "2026-08-06", rates: { BRL: rate } }),
    })
  );
}

describe("convertBrlToUsdc", () => {
  it("converte reais para USDC pela cotação retornada", async () => {
    mockFetchOnce(5);
    const { convertBrlToUsdc } = await import("./fx-rate");
    expect(await convertBrlToUsdc(100)).toBe(20);
  });

  it("arredonda para 2 casas decimais", async () => {
    mockFetchOnce(5.1153);
    const { convertBrlToUsdc } = await import("./fx-rate");
    expect(await convertBrlToUsdc(100)).toBe(19.55);
  });

  it("propaga um erro claro quando a API de câmbio falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const { convertBrlToUsdc } = await import("./fx-rate");
    await expect(convertBrlToUsdc(100)).rejects.toThrow();
  });

  it("propaga um erro claro quando a cotação vem inválida (não numérica)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ rates: {} }) })
    );
    const { convertBrlToUsdc } = await import("./fx-rate");
    await expect(convertBrlToUsdc(100)).rejects.toThrow();
  });

  it("não consulta a API de novo dentro da janela de cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { BRL: 5 } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { convertBrlToUsdc } = await import("./fx-rate");

    await convertBrlToUsdc(100);
    await convertBrlToUsdc(200);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
