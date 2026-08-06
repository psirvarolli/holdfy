import "server-only";
import { Keypair, TransactionBuilder, Networks } from "@stellar/stellar-sdk";

const BASE_URL = process.env.TRUSTLESS_WORK_BASE_URL!;
const API_KEY = process.env.TRUSTLESS_WORK_API_KEY!;
const USDC_ISSUER = process.env.USDC_ISSUER!;
const PLATFORM_PUBLIC_KEY = process.env.HOLDFY_PLATFORM_PUBLIC_KEY!;
const PLATFORM_SECRET_KEY = process.env.HOLDFY_PLATFORM_SECRET_KEY!;

export class TrustlessWorkError extends Error {}

async function twPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data.status === "FAILED") {
    throw new TrustlessWorkError(data.message ?? `Trustless Work ${path} falhou (${res.status})`);
  }
  return data as T;
}

async function twGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "x-api-key": API_KEY },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new TrustlessWorkError(data.message ?? `Trustless Work ${path} falhou (${res.status})`);
  }
  return data as T;
}

export interface EscrowState {
  contractId: string;
  amount: number;
  balance: number;
  flags: { disputed: boolean; released: boolean; resolved: boolean };
  milestones: { status: string; approved: boolean }[];
  roles: {
    approver: string;
    serviceProvider: string;
    receiver: string;
    releaseSigner: string;
    disputeResolver: string;
    platformAddress: string;
  };
}

// Lê o estado real do contrato on-chain — é contra isto, não contra o que o
// navegador diz que aconteceu, que cada rota "confirm" valida antes de
// gravar qualquer mudança de status no banco.
export async function getEscrowState(contractId: string): Promise<EscrowState | null> {
  const [escrow] = await twGet<EscrowState[]>(
    `/helper/get-escrow-by-contract-ids?contractIds[]=${encodeURIComponent(contractId)}`
  );
  return escrow ?? null;
}

// Um ledger da Stellar fecha a cada ~5s, então uma transação recém-enviada
// pode ainda não aparecer na leitura por um instante. Em vez de rejeitar de
// primeira, espera algumas rodadas antes de desistir.
export async function waitForEscrowState(
  contractId: string,
  predicate: (escrow: EscrowState) => boolean,
  attempts = 4,
  delayMs = 1500
): Promise<EscrowState | null> {
  for (let i = 0; i < attempts; i++) {
    const escrow = await getEscrowState(contractId);
    if (escrow && predicate(escrow)) return escrow;
    if (i < attempts - 1) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
}

interface UnsignedTxResponse {
  status: "SUCCESS";
  unsignedTransaction: string;
}

interface SendTransactionResponse {
  status: "SUCCESS";
  message: string;
  contractId: string;
  escrow: unknown;
}

// Um único milestone: a Holdfy usa escrow single-release simples (sem etapas
// intermediárias) — a entrega inteira é "o milestone".
const MILESTONE_DESCRIPTION = "Entrega confirmada pelo comprador";

export interface DeployEscrowParams {
  engagementId: string;
  title: string;
  description: string;
  amount: number;
  platformFeePercent: number;
  sellerAddress: string;
  buyerAddress: string;
  // Produto digital (sem frete/etapa de envio física): a própria Holdfy
  // assume o papel de serviceProvider e completa o milestone automaticamente
  // assim que o pagamento é confirmado (ver completeMilestoneAsPlatform),
  // em vez de esperar o vendedor "marcar como enviado". `receiver` continua
  // sendo o vendedor — é ele quem recebe o valor, isso não muda.
  digitalDelivery?: boolean;
}

// Assina localmente com a chave da carteira da plataforma (Holdfy) e envia via
// /helper/send-transaction — é a própria Trustless Work quem devolve o
// contractId real nessa resposta, então esse é o único caminho confiável para
// descobri-lo (a Pollar, para carteiras custodiais, só assina-e-envia direto
// pra rede Stellar, sem passar pelo endpoint da Trustless Work).
async function signAndSendWithPlatformWallet(unsignedTransaction: string): Promise<SendTransactionResponse> {
  const keypair = Keypair.fromSecret(PLATFORM_SECRET_KEY);
  const tx = TransactionBuilder.fromXDR(unsignedTransaction, Networks.TESTNET);
  tx.sign(keypair);
  return twPost<SendTransactionResponse>("/helper/send-transaction", { signedXdr: tx.toXDR() });
}

// Deploya o escrow (assinado pela própria Holdfy, que paga a taxa de rede da
// criação do contrato) e devolve o contractId real, já confirmado on-chain.
export async function deploySingleReleaseEscrow(params: DeployEscrowParams): Promise<{ contractId: string }> {
  const { unsignedTransaction } = await twPost<UnsignedTxResponse>("/deployer/single-release", {
    signer: PLATFORM_PUBLIC_KEY,
    engagementId: params.engagementId,
    title: params.title,
    description: params.description,
    roles: {
      approver: params.buyerAddress,
      serviceProvider: params.digitalDelivery ? PLATFORM_PUBLIC_KEY : params.sellerAddress,
      receiver: params.sellerAddress,
      releaseSigner: params.buyerAddress,
      disputeResolver: PLATFORM_PUBLIC_KEY,
      platformAddress: PLATFORM_PUBLIC_KEY,
    },
    amount: params.amount,
    platformFee: params.platformFeePercent,
    milestones: [{ description: MILESTONE_DESCRIPTION }],
    trustline: { symbol: "USDC", address: USDC_ISSUER },
  });
  const result = await signAndSendWithPlatformWallet(unsignedTransaction);
  return { contractId: result.contractId };
}

// A partir daqui, cada "build" devolve uma transação não assinada para o
// cliente assinar com a carteira Pollar de quem tem esse papel no escrow
// (comprador ou vendedor) — a Holdfy nunca tem a chave dessas carteiras.

export async function buildFundEscrow(contractId: string, buyerAddress: string, amount: number) {
  return twPost<UnsignedTxResponse>("/escrow/single-release/fund-escrow", {
    contractId,
    signer: buyerAddress,
    amount,
  });
}

export async function buildChangeMilestoneStatus(contractId: string, sellerAddress: string, evidence: string) {
  return twPost<UnsignedTxResponse>("/escrow/single-release/change-milestone-status", {
    contractId,
    milestoneIndex: "0",
    newStatus: "Completed",
    newEvidence: evidence,
    serviceProvider: sellerAddress,
  });
}

// Só vale para escrows implantados com digitalDelivery: true (serviceProvider
// = a própria Holdfy) — completa o milestone sem depender de nenhuma ação do
// vendedor, já assinado e enviado pela carteira da plataforma, igual ao
// deploy e à resolução de disputa.
export async function completeMilestoneAsPlatform(
  contractId: string,
  evidence: string
): Promise<SendTransactionResponse> {
  const { unsignedTransaction } = await twPost<UnsignedTxResponse>(
    "/escrow/single-release/change-milestone-status",
    {
      contractId,
      milestoneIndex: "0",
      newStatus: "Completed",
      newEvidence: evidence,
      serviceProvider: PLATFORM_PUBLIC_KEY,
    }
  );
  return signAndSendWithPlatformWallet(unsignedTransaction);
}

export async function buildApproveMilestone(contractId: string, buyerAddress: string) {
  return twPost<UnsignedTxResponse>("/escrow/single-release/approve-milestone", {
    contractId,
    milestoneIndex: "0",
    approver: buyerAddress,
  });
}

export async function buildReleaseFunds(contractId: string, buyerAddress: string) {
  return twPost<UnsignedTxResponse>("/escrow/single-release/release-funds", {
    contractId,
    releaseSigner: buyerAddress,
  });
}

export async function buildDisputeEscrow(contractId: string, signerAddress: string) {
  return twPost<UnsignedTxResponse>("/escrow/single-release/dispute-escrow", {
    contractId,
    signer: signerAddress,
  });
}

// Resolução de disputa é decidida e assinada pela própria Holdfy (papel
// disputeResolver) — não precisa de nenhuma assinatura do comprador/vendedor,
// por isso já sai assinada e enviada, sem passo intermediário no cliente.
export async function resolveDisputeAsPlatform(
  contractId: string,
  distributions: { address: string; amount: number }[]
): Promise<SendTransactionResponse> {
  const { unsignedTransaction } = await twPost<UnsignedTxResponse>("/escrow/single-release/resolve-dispute", {
    contractId,
    disputeResolver: PLATFORM_PUBLIC_KEY,
    distributions,
  });
  return signAndSendWithPlatformWallet(unsignedTransaction);
}
