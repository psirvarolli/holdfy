import { NextResponse } from "next/server";
import { WebAuth } from "@stellar/stellar-sdk";
import { z } from "zod";
import { networkPassphrase } from "@/lib/server/stellar-network";
import { parseJsonBody } from "@/lib/server/validation";
import { isRateLimited } from "@/lib/server/rate-limit";
import {
  createWalletSessionToken,
  WALLET_SESSION_COOKIE,
  WALLET_SESSION_TTL_SECONDS,
} from "@/lib/server/wallet-session";

const PLATFORM_PUBLIC_KEY = process.env.HOLDFY_PLATFORM_PUBLIC_KEY!;
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutos

const schema = z.object({ signedXdr: z.string().min(1) });

// Segundo passo do SEP-10: confere que a assinatura na transação-desafio
// devolvida pertence mesmo à carteira que a gerou (extraída da própria
// transação via readChallengeTx — nunca de um campo separado que o cliente
// poderia forjar). Se bater, essa é a prova criptográfica de posse da
// carteira; grava a sessão com esse endereço.
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await isRateLimited(`auth-verify:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Muitas tentativas seguidas. Aguarde alguns minutos." }, { status: 429 });
  }

  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const homeDomain = new URL(request.url).host;

  let clientAccountID: string;
  try {
    ({ clientAccountID } = WebAuth.readChallengeTx(
      parsed.data.signedXdr,
      PLATFORM_PUBLIC_KEY,
      networkPassphrase,
      homeDomain,
      homeDomain
    ));
  } catch {
    return NextResponse.json({ error: "Desafio de autenticação inválido ou expirado." }, { status: 401 });
  }

  try {
    const signers = WebAuth.verifyChallengeTxSigners(
      parsed.data.signedXdr,
      PLATFORM_PUBLIC_KEY,
      networkPassphrase,
      [clientAccountID],
      homeDomain,
      homeDomain
    );
    if (!signers.includes(clientAccountID)) {
      return NextResponse.json({ error: "Assinatura não confere com a carteira." }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Assinatura não confere com a carteira." }, { status: 401 });
  }

  const token = await createWalletSessionToken(clientAccountID);
  const res = NextResponse.json({ address: clientAccountID });
  res.cookies.set(WALLET_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: WALLET_SESSION_TTL_SECONDS,
  });
  return res;
}
