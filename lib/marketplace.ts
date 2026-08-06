// Importação de anúncios de marketplaces para pré-preencher a criação de pedidos.
//
// Tipos e checagens que também rodam no navegador (validação de URL, nome do
// marketplace pra exibição). A busca de verdade — que precisa fazer uma
// requisição de servidor e não pode rodar no navegador por causa de CORS —
// fica em lib/server/marketplace.ts.

export interface MarketplaceListing {
  marketplace: string;
  title: string;
  description: string;
  price: number;
  shippingCost: number;
}

// Sites onde tentamos ler os dados publicados na própria página (sem API
// oficial nenhuma — funciona quando o site não bloqueia automação e publica
// tags Open Graph/JSON-LD decentes; não é garantido).
export const MARKETPLACES: { pattern: RegExp; name: string }[] = [
  { pattern: /mercadolivre|mercadolibre/i, name: "Mercado Livre" },
  { pattern: /olx/i, name: "OLX" },
  { pattern: /aliexpress/i, name: "AliExpress" },
  { pattern: /shein/i, name: "Shein" },
  { pattern: /magazineluiza|magalu/i, name: "Magazine Luiza" },
];

// Sites que sabidamente bloqueiam esse tipo de busca automática ou não têm
// nenhum caminho público pra isso (Shopee e Amazon têm proteção forte contra
// automação e só oferecem API pra quem já vende lá; Instagram não é uma loja
// com dados estruturados de produto). Nesses casos, nem tentamos — avisamos
// direto que só dá pra preencher manualmente.
export const UNSUPPORTED_MARKETPLACES: { pattern: RegExp; name: string }[] = [
  { pattern: /shopee/i, name: "Shopee" },
  { pattern: /amazon/i, name: "Amazon" },
  { pattern: /instagram/i, name: "Instagram" },
];

export function isValidListingUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function detectMarketplaceName(url: string): string {
  return MARKETPLACES.find((m) => m.pattern.test(url))?.name ?? "Marketplace";
}

export function detectUnsupportedMarketplace(url: string): string | null {
  return UNSUPPORTED_MARKETPLACES.find((m) => m.pattern.test(url))?.name ?? null;
}
