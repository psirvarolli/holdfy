import { Networks } from "@stellar/stellar-sdk";

// Equivalente client-safe de lib/server/stellar-network.ts — o admin (via
// Freighter) precisa saber o passphrase da rede pra assinar, mas esse
// arquivo roda no navegador, então não pode importar nada marcado
// "server-only" nem ler segredos. NEXT_PUBLIC_STELLAR_NETWORK deve sempre
// espelhar STELLAR_NETWORK (o lado servidor).
const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";

export const networkPassphrase = NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
