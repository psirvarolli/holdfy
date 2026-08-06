import "server-only";

// Frankfurter: cotações de referência do Banco Central Europeu, gratuita,
// sem chave de API. Atualiza uma vez por dia útil (~16h CET) — o cache aqui
// é só pra não bater na API a cada requisição, não pra "economizar" precisão
// que ela não tem de qualquer forma.
const FX_API_URL = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

let cached: { rate: number; fetchedAt: number } | null = null;

// Quantos reais valem 1 dólar agora. É uma cotação de referência para decidir
// quanto USDC um pedido em reais deve exigir — não é a cotação de execução
// real de uma compra/venda via Pix (essa, o próprio Pollar cota na hora,
// dentro do modal de rampa, com o spread dele).
export async function getUsdToBrlRate(): Promise<number> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rate;
  }

  const res = await fetch(FX_API_URL);
  if (!res.ok) {
    throw new Error("Não consegui consultar a cotação do dólar agora. Tente de novo em instantes.");
  }
  const data = await res.json();
  const rate = data?.rates?.BRL;
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    throw new Error("Cotação do dólar inválida recebida do serviço de câmbio.");
  }

  cached = { rate, fetchedAt: Date.now() };
  return rate;
}

// USDC vale 1:1 com o dólar, então converter R$ -> USDC é o mesmo que
// converter R$ -> USD. Arredonda para 2 casas (mesma precisão que o resto do
// app já usa para valores em reais), bem abaixo das 7 casas que a Stellar
// suporta.
export async function convertBrlToUsdc(brlAmount: number): Promise<number> {
  const rate = await getUsdToBrlRate();
  return Math.round((brlAmount / rate) * 100) / 100;
}
