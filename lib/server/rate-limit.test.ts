import { describe, it, expect, vi, afterEach } from "vitest";
import { isRateLimited } from "./rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("isRateLimited", () => {
  it("permite requisições dentro do limite", () => {
    const key = "teste:dentro-do-limite";
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(key, 5, 60_000)).toBe(false);
    }
  });

  it("bloqueia a partir da requisição que excede o limite", () => {
    const key = "teste:excede-limite";
    for (let i = 0; i < 5; i++) {
      isRateLimited(key, 5, 60_000);
    }
    expect(isRateLimited(key, 5, 60_000)).toBe(true);
  });

  it("chaves diferentes não interferem uma na outra", () => {
    for (let i = 0; i < 5; i++) {
      isRateLimited("teste:chave-a", 5, 60_000);
    }
    // "chave-a" já estourou o limite, mas "chave-b" começa do zero.
    expect(isRateLimited("teste:chave-b", 5, 60_000)).toBe(false);
  });

  it("libera de novo depois que a janela de tempo passa", () => {
    vi.useFakeTimers();
    const key = "teste:janela-expira";
    for (let i = 0; i < 5; i++) {
      isRateLimited(key, 5, 60_000);
    }
    expect(isRateLimited(key, 5, 60_000)).toBe(true);

    vi.advanceTimersByTime(60_001);
    expect(isRateLimited(key, 5, 60_000)).toBe(false);
  });
});
