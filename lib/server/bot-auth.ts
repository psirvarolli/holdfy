import "server-only";

// Autenticação simples de servidor-para-servidor pro bot de WhatsApp
// (repositório separado, holdfy-whatsapp). Ele já resolveu e verificou o
// sellerAddress através do vínculo telefone→carteira que o próprio vendedor
// cadastrou (ver lib/server/seller-whatsapp.ts) antes de chamar esta API —
// não faz sentido pedir uma sessão de navegador que o bot nunca vai ter.
// Continua "confiável" só porque as duas partes (site e bot) são operadas
// pela própria Holdfy e compartilham este segredo; não é autenticação de
// usuário real, é autenticação de serviço.
export function isTrustedBotRequest(request: Request): boolean {
  const secret = process.env.HOLDFY_BOT_API_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
