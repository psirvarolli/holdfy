import "server-only";
import { Networks } from "@stellar/stellar-sdk";

// Um único lugar que decide "estamos na testnet ou no mainnet da Stellar" —
// antes disso, o passphrase da rede estava escrito fixo (Networks.TESTNET)
// dentro de trustless-work.ts, então trocar para mainnet exigiria mexer em
// código em vez de só trocar variável de ambiente. STELLAR_NETWORK é a fonte
// da verdade; tudo que depende da rede (passphrase de assinatura, Horizon,
// Friendbot) deriva daqui.
export type StellarNetwork = "testnet" | "mainnet";

function readNetwork(): StellarNetwork {
  const value = process.env.STELLAR_NETWORK ?? "testnet";
  if (value !== "testnet" && value !== "mainnet") {
    throw new Error(`STELLAR_NETWORK inválido: "${value}" (use "testnet" ou "mainnet").`);
  }
  return value;
}

export const STELLAR_NETWORK: StellarNetwork = readNetwork();

export const networkPassphrase =
  STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

export const horizonUrl =
  STELLAR_NETWORK === "mainnet" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org";

export const friendbotUrl: string | null =
  STELLAR_NETWORK === "mainnet" ? null : "https://friendbot.stellar.org";

// Guarda-corpo contra o erro real que motivou este arquivo: alguém trocar
// STELLAR_NETWORK para "mainnet" e esquecer de trocar TRUSTLESS_WORK_BASE_URL
// (que continuaria apontando para o ambiente de dev da Trustless Work), ou
// vice-versa. Falha alto e cedo em vez de assinar transações com o passphrase
// errado para o endpoint errado.
export function assertTrustlessWorkUrlMatchesNetwork(baseUrl: string): void {
  const looksLikeDev = baseUrl.includes("dev.api.trustlesswork.com");
  if (STELLAR_NETWORK === "mainnet" && looksLikeDev) {
    throw new Error(
      "STELLAR_NETWORK=mainnet mas TRUSTLESS_WORK_BASE_URL ainda aponta para o ambiente de dev da Trustless Work. " +
        "Atualize TRUSTLESS_WORK_BASE_URL para o endpoint de produção antes de continuar."
    );
  }
  if (STELLAR_NETWORK === "testnet" && !looksLikeDev) {
    throw new Error(
      "STELLAR_NETWORK=testnet mas TRUSTLESS_WORK_BASE_URL não parece ser o ambiente de dev da Trustless Work. " +
        "Confira se as duas variáveis estão apontando para o mesmo ambiente."
    );
  }
}
