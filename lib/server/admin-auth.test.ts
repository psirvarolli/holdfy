import { describe, it, expect, beforeEach } from "vitest";
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
  verifyAdminPassword,
} from "./admin-auth";

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = "segredo-de-teste-nao-use-em-producao";
  process.env.ADMIN_PASSWORD = "senha-correta-123";
});

describe("createAdminSessionToken / verifyAdminSessionToken", () => {
  it("aceita um token recém-criado", async () => {
    const token = await createAdminSessionToken();
    expect(await verifyAdminSessionToken(token)).toBe(true);
  });

  it("rejeita um token vazio ou ausente", async () => {
    expect(await verifyAdminSessionToken("")).toBe(false);
    expect(await verifyAdminSessionToken(undefined)).toBe(false);
    expect(await verifyAdminSessionToken(null)).toBe(false);
  });

  it("rejeita um token com assinatura adulterada", async () => {
    const token = await createAdminSessionToken();
    const [subject, expiresAt] = token.split(".");
    const forged = `${subject}.${expiresAt}.assinaturafalsa`;
    expect(await verifyAdminSessionToken(forged)).toBe(false);
  });

  it("rejeita um token cujo prazo já passou, mesmo com assinatura válida para esse conteúdo", async () => {
    // Constrói um token com prazo no passado, mas assinado corretamente pelo
    // próprio código sob teste — simula um cookie válido que só está expirado.
    const pastExpiry = Math.floor(Date.now() / 1000) - 60;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET!),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const payload = `admin.${pastExpiry}`;
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const hex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const expiredToken = `${payload}.${hex}`;

    expect(await verifyAdminSessionToken(expiredToken)).toBe(false);
  });

  it("rejeita um token assinado com um segredo diferente", async () => {
    const token = await createAdminSessionToken();
    process.env.ADMIN_SESSION_SECRET = "outro-segredo-completamente-diferente";
    expect(await verifyAdminSessionToken(token)).toBe(false);
  });
});

describe("verifyAdminPassword", () => {
  it("aceita a senha correta", async () => {
    expect(await verifyAdminPassword("senha-correta-123")).toBe(true);
  });

  it("rejeita uma senha errada", async () => {
    expect(await verifyAdminPassword("senha-errada")).toBe(false);
  });

  it("rejeita quando ADMIN_PASSWORD não está configurada", async () => {
    delete process.env.ADMIN_PASSWORD;
    expect(await verifyAdminPassword("qualquer-coisa")).toBe(false);
  });
});
