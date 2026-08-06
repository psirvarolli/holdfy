import { describe, it, expect } from "vitest";
import { stellarAddress, userRole, money, parseJsonBody } from "./validation";

describe("stellarAddress", () => {
  it("aceita um endereço Stellar válido (G + 55 caracteres base32)", () => {
    const result = stellarAddress.safeParse(
      "GA63XHUHVYU22DWNMUNMSUSCAZS5JC2XSULK7VCEDUOOF2FMS6BWHR4S"
    );
    expect(result.success).toBe(true);
  });

  it("rejeita um endereço curto demais", () => {
    expect(stellarAddress.safeParse("GAAA").success).toBe(false);
  });

  it("rejeita um endereço que não começa com G", () => {
    expect(
      stellarAddress.safeParse("SA63XHUHVYU22DWNMUNMSUSCAZS5JC2XSULK7VCEDUOOF2FMS6BWHR4S").success
    ).toBe(false);
  });

  it("rejeita minúsculas (base32 do Stellar é sempre maiúsculo)", () => {
    expect(
      stellarAddress.safeParse("ga63xhuhvyu22dwnmunmsuscazs5jc2xsulk7vceduoof2fms6bwhr4s").success
    ).toBe(false);
  });

  it("rejeita um texto qualquer", () => {
    expect(stellarAddress.safeParse("nao-eh-um-endereco").success).toBe(false);
  });
});

describe("userRole", () => {
  it("aceita 'comprador' e 'vendedor'", () => {
    expect(userRole.safeParse("comprador").success).toBe(true);
    expect(userRole.safeParse("vendedor").success).toBe(true);
  });

  it("rejeita qualquer outro valor", () => {
    expect(userRole.safeParse("admin").success).toBe(false);
    expect(userRole.safeParse("").success).toBe(false);
    expect(userRole.safeParse(null).success).toBe(false);
  });
});

describe("money", () => {
  it("aceita números finitos, incluindo zero e negativos (a rota decide o sinal)", () => {
    expect(money.safeParse(0).success).toBe(true);
    expect(money.safeParse(10.5).success).toBe(true);
    expect(money.safeParse(-5).success).toBe(true);
  });

  it("rejeita NaN e Infinity", () => {
    expect(money.safeParse(NaN).success).toBe(false);
    expect(money.safeParse(Infinity).success).toBe(false);
  });

  it("nonnegative() rejeita negativos", () => {
    expect(money.nonnegative().safeParse(-0.01).success).toBe(false);
    expect(money.nonnegative().safeParse(0).success).toBe(true);
  });

  it("positive() rejeita zero", () => {
    expect(money.positive().safeParse(0).success).toBe(false);
    expect(money.positive().safeParse(0.01).success).toBe(true);
  });
});

describe("parseJsonBody", () => {
  it("retorna os dados quando o corpo é válido", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      body: JSON.stringify("comprador"),
    });
    const result = await parseJsonBody(request, userRole);
    expect("error" in result).toBe(false);
  });

  it("retorna erro 400 quando o JSON é inválido", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      body: "isso não é json",
    });
    const result = await parseJsonBody(request, userRole);
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(400);
    }
  });

  it("retorna erro 400 quando os dados não passam no schema", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      body: JSON.stringify({ brl: "não é number" }),
    });
    const result = await parseJsonBody(request, money);
    expect("error" in result).toBe(true);
  });
});
