import { describe, it, expect, afterAll } from "vitest";
import { Keypair, TransactionBuilder, Networks } from "@stellar/stellar-sdk";
import { prisma } from "@/lib/prisma";
import { POST as challenge } from "@/app/api/auth/challenge/route";
import { POST as verify } from "@/app/api/auth/verify/route";

// Sem mocks: gera uma carteira Stellar de verdade e passa pelo fluxo SEP-10
// real (desafio assinado pela Holdfy, contra-assinado pela carteira,
// conferido com @stellar/stellar-sdk) — é justamente a assinatura
// criptográfica que está sendo testada, então mockar qualquer parte disso
// não provaria nada. STELLAR_NETWORK local é "testnet" (ver .env), então o
// desafio é assinado com Networks.TESTNET.
async function establishSession(address: string) {
  const challengeRes = await challenge(
    new Request("http://localhost:3000/api/auth/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })
  );
  return challengeRes;
}

afterAll(async () => {
  await prisma.rateLimitBucket.deleteMany({ where: { key: { in: ["auth-challenge:unknown", "auth-verify:unknown"] } } });
  await prisma.$disconnect();
});

describe("SEP-10: /api/auth/challenge + /api/auth/verify", () => {
  it("emite um desafio válido para um endereço bem formado", async () => {
    const kp = Keypair.random();
    const res = await establishSession(kp.publicKey());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.challengeXdr).toEqual(expect.any(String));
  });

  it("recusa um endereço mal formado antes de gerar qualquer desafio", async () => {
    const res = await establishSession("nao-e-um-endereco-stellar");
    expect(res.status).toBe(400);
  });

  it("autentica quem realmente assina o desafio com a chave da carteira reivindicada", async () => {
    const kp = Keypair.random();
    const challengeRes = await establishSession(kp.publicKey());
    const { challengeXdr } = await challengeRes.json();

    const tx = TransactionBuilder.fromXDR(challengeXdr, Networks.TESTNET);
    tx.sign(kp);
    const signedXdr = tx.toEnvelope().toXDR("base64");

    const verifyRes = await verify(
      new Request("http://localhost:3000/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr }),
      })
    );
    expect(verifyRes.status).toBe(200);
    const body = await verifyRes.json();
    expect(body.address).toBe(kp.publicKey());
    expect(verifyRes.headers.get("set-cookie")).toContain("holdfy_wallet_session=");
  });

  it("recusa uma assinatura que não pertence à carteira reivindicada no desafio", async () => {
    const claimed = Keypair.random();
    const impostor = Keypair.random();
    const challengeRes = await establishSession(claimed.publicKey());
    const { challengeXdr } = await challengeRes.json();

    // Assina com uma chave diferente da que foi usada pra gerar o desafio —
    // o desafio SEP-10 é montado com a conta reivindicada como source, então
    // uma assinatura de outra chave nunca corresponde ao signer esperado.
    const tx = TransactionBuilder.fromXDR(challengeXdr, Networks.TESTNET);
    tx.sign(impostor);
    const signedXdr = tx.toEnvelope().toXDR("base64");

    const verifyRes = await verify(
      new Request("http://localhost:3000/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr }),
      })
    );
    expect(verifyRes.status).toBe(401);
  });

  it("recusa uma transação-desafio adulterada (não veio de /api/auth/challenge)", async () => {
    const verifyRes = await verify(
      new Request("http://localhost:3000/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr: "isso-nao-e-um-xdr-valido" }),
      })
    );
    expect(verifyRes.status).toBe(401);
  });
});
