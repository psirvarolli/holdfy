// Script único de setup: gera a conta Stellar dedicada ao papel
// disputeResolver, financia via Friendbot (testnet) e estabelece a trustline
// de USDC (mesma exigência que já vale para as outras contas de papel no
// escrow — sem trustline, o deploy da Trustless Work rejeita com 400).
//
// Rodar de novo mais tarde só recria a conta do zero — não é o fluxo normal.
// Uso: node scripts/setup-dispute-resolver.mjs
import { Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from "@stellar/stellar-sdk";
import { Horizon } from "@stellar/stellar-sdk";

const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

const keypair = Keypair.random();
console.log("Chave gerada:");
console.log("HOLDFY_DISPUTE_RESOLVER_PUBLIC_KEY=" + keypair.publicKey());
console.log("HOLDFY_DISPUTE_RESOLVER_SECRET_KEY=" + keypair.secret());

console.log("\nFinanciando via Friendbot...");
const resp = await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
if (!resp.ok) throw new Error(`Friendbot falhou: ${resp.status} ${await resp.text()}`);
console.log("Financiado.");

console.log("\nEstabelecendo trustline USDC...");
const account = await horizon.loadAccount(keypair.publicKey());
const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(
    Operation.changeTrust({
      asset: new Asset("USDC", USDC_ISSUER),
    })
  )
  .setTimeout(180)
  .build();
tx.sign(keypair);
const result = await horizon.submitTransaction(tx);
console.log("Trustline estabelecida. Hash:", result.hash);
