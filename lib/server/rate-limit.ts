import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

// Limitador simples em memória — funciona bem para uma única instância do
// servidor, que é o que existe hoje. Numa implantação com múltiplas
// instâncias (ex: várias funções serverless), cada uma teria seu próprio
// contador; nesse cenário isto precisaria virar um armazenamento
// compartilhado (Redis, Upstash, etc.) em vez de um Map na memória.
const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}
