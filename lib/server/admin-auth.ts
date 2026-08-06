import "server-only";

// Usa Web Crypto (não o módulo `crypto` do Node) de propósito: este módulo é
// importado pelo proxy.ts, que roda no runtime Edge — Web Crypto funciona
// igual nos dois ambientes, o módulo `crypto` do Node não.

export const ADMIN_SESSION_COOKIE = "holdfy_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 horas
const SESSION_SUBJECT = "admin"; // só existe uma conta admin hoje (a própria Holdfy)

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(message: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

// O token carrega a própria validade (`subject.expiresAt.assinatura`) — a
// verificação confere isso no servidor, não só o prazo do cookie (que é só
// uma instrução para o navegador e não impede um cookie copiado de ser
// reenviado manualmente depois de expirado).
export async function createAdminSessionToken(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = `${SESSION_SUBJECT}.${expiresAt}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [subject, expiresAtRaw, signature] = parts;
  if (subject !== SESSION_SUBJECT) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() / 1000 > expiresAt) return false;

  const payload = `${subject}.${expiresAtRaw}`;
  return timingSafeEqual(signature, await hmac(payload));
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password.length !== expected.length) return false;
  return timingSafeEqual(password, expected);
}
