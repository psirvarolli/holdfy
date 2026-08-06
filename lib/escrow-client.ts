"use client";

// Orquestra o padrão "build -> assina -> envia" da Trustless Work: busca uma
// transação não assinada numa rota da nossa API e assina/envia com a
// carteira Pollar de quem está logado. `signAndSubmitTx` vem de
// usePollar() — aceita XDR de qualquer origem, não só transações construídas
// pela própria Pollar.
type SignAndSubmitTx = (unsignedXdr: string) => Promise<{
  status: "success" | "pending" | "error";
  hash?: string;
  details?: string;
  message?: string;
}>;

export async function buildSignAndSubmit(
  buildUrl: string,
  buildBody: unknown,
  signAndSubmitTx: SignAndSubmitTx
): Promise<void> {
  const buildRes = await fetch(buildUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildBody),
  });
  const buildData = await buildRes.json();
  if (!buildRes.ok) {
    throw new Error(buildData.error ?? `Falha ao preparar a transação (${buildRes.status}).`);
  }

  const outcome = await signAndSubmitTx(buildData.unsignedTransaction);
  if (outcome.status === "error") {
    throw new Error(outcome.details ?? outcome.message ?? "Falha ao assinar/enviar a transação na Stellar.");
  }
}
