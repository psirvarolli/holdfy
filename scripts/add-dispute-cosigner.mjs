// Passo final da multiassinatura 2-de-2 na conta disputeResolver: adiciona a
// chave pública pessoal (Freighter) de quem vai co-assinar resoluções de
// disputa como 2º signatário, e sobe os thresholds da conta pra 2 — depois
// disso, nem a chave do servidor nem a pessoal sozinha bastam mais; as duas
// juntas (peso 1 + peso 1 = 2) são exigidas.
//
// Roda uma vez só, quando a chave pública pessoal estiver em mãos (nunca a
// secreta — essa nunca deve sair de quem é dono dela).
//
// Uso: node --env-file=.env scripts/add-dispute-cosigner.mjs <CHAVE_PUBLICA_G...>
import { Keypair, TransactionBuilder, Networks, Operation, BASE_FEE, Horizon } from "@stellar/stellar-sdk";

const cosignerPublicKey = process.argv[2];
if (!cosignerPublicKey || !cosignerPublicKey.startsWith("G")) {
  console.error("Uso: node scripts/add-dispute-cosigner.mjs <CHAVE_PUBLICA_G...>");
  process.exit(1);
}

const secret = process.env.HOLDFY_DISPUTE_RESOLVER_SECRET_KEY;
if (!secret) throw new Error("HOLDFY_DISPUTE_RESOLVER_SECRET_KEY não encontrada no .env");

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
const keypair = Keypair.fromSecret(secret);

const account = await horizon.loadAccount(keypair.publicKey());
const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(
    Operation.setOptions({
      signer: { ed25519PublicKey: cosignerPublicKey, weight: 1 },
      lowThreshold: 2,
      medThreshold: 2,
      highThreshold: 2,
    })
  )
  .setTimeout(180)
  .build();
tx.sign(keypair);

const result = await horizon.submitTransaction(tx);
console.log("Conta disputeResolver agora é 2-de-2. Hash:", result.hash);
console.log("Signatários:");
const updated = await horizon.loadAccount(keypair.publicKey());
console.log(updated.signers);
