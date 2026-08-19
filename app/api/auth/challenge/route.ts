import { NextResponse } from "next/server";
import { Keypair, WebAuth } from "@stellar/stellar-sdk";
import { networkPassphrase } from "@/lib/server/stellar-network";
import { stellarAddress, parseJsonBody } from "@/lib/server/validation";
import { isRateLimited } from "@/lib/server/rate-limit";
import { z } from "zod";

const PLATFORM_SECRET_KEY = process.env.HOLDFY_PLATFORM_SECRET_KEY!;
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutos

const schema = z.object({ address: stellarAddress });

// Primeiro passo do login por carteira (SEP-10): monta um desafio assinado
// pela própria Holdfy, que só quem tem a chave privada do endereço
// reivindicado consegue contra-assinar de forma válida — ver
// app/api/auth/verify/route.ts para a conferência. O "home domain" aqui não
// federa com ninguém de fora; é só a Holdfy verificando a si mesma, então
// usar o host da própria requisição é suficiente e sempre correto, em dev ou
// produção.
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await isRateLimited(`auth-challenge:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Muitas tentativas seguidas. Aguarde alguns minutos." }, { status: 429 });
  }

  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  const homeDomain = new URL(request.url).host;
  const serverKeypair = Keypair.fromSecret(PLATFORM_SECRET_KEY);

  const challengeXdr = WebAuth.buildChallengeTx(
    serverKeypair,
    parsed.data.address,
    homeDomain,
    300,
    networkPassphrase,
    homeDomain
  );

  return NextResponse.json({ challengeXdr, homeDomain });
}
