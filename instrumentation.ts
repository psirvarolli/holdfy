// Registra o Sentry no runtime certo (Node ou Edge) — chamado automaticamente
// pelo Next.js na inicialização do servidor. Ver auditoria de mainnet, ponto
// 6: sem isso, um erro em produção só aparecia se alguém fosse olhar os logs
// da Vercel manualmente.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) => {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
