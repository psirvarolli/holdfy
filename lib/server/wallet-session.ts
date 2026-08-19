import "server-only";

// Mesmo padrão de lib/server/admin-auth.ts (HMAC via Web Crypto, funciona
// tanto no runtime Node quanto no Edge) — aqui a sessão carrega o endereço
// Stellar verificado por SEP-10 (ver app/api/auth/verify/route.ts), em vez
// de um "subject" fixo.

export const WALLET_SESSION_COOKIE = "holdfy_wallet_session";
export const WALLET_SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 horas

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

// address.expiresAt.assinatura — mesma ideia do token de admin: a validade
// vai dentro do próprio token, então uma cópia do cookie reenviada depois de
// expirado não passa mesmo que o navegador não tivesse apagado o cookie.
export async function createWalletSessionToken(address: string): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + WALLET_SESSION_TTL_SECONDS;
  const payload = `${address}.${expiresAt}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyWalletSessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [address, expiresAtRaw, signature] = parts;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() / 1000 > expiresAt) return null;

  const payload = `${address}.${expiresAtRaw}`;
  const valid = timingSafeEqual(signature, await hmac(payload));
  return valid ? address : null;
}

// Lida direto com a Request (em vez de exigir o helper `cookies()` do Next,
// que só funciona em Server Components/Route Handlers específicos) — assim
// funciona igual em qualquer rota que receba um `Request` puro.
export async function getSessionAddress(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${WALLET_SESSION_COOKIE}=`));
  if (!match) return null;
  const token = decodeURIComponent(match.slice(WALLET_SESSION_COOKIE.length + 1));
  return verifyWalletSessionToken(token);
}
