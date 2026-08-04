// Importação de anúncios de marketplaces para pré-preencher a criação de pedidos.
//
// TODO: substituir por um serviço real no backend que leia o anúncio (meta tags
// Open Graph e/ou APIs oficiais do Mercado Livre, Shopee, Amazon, OLX etc.) e
// devolva título, descrição, preço e frete. Não é possível buscar essas páginas
// diretamente do navegador por causa de CORS — isso precisa rodar server-side.

export interface MarketplaceListing {
  marketplace: string;
  title: string;
  description: string;
  price: number;
  shippingCost: number;
}

const MARKETPLACES: { pattern: RegExp; name: string }[] = [
  { pattern: /mercadolivre|mercadolibre/i, name: "Mercado Livre" },
  { pattern: /shopee/i, name: "Shopee" },
  { pattern: /amazon/i, name: "Amazon" },
  { pattern: /olx/i, name: "OLX" },
  { pattern: /aliexpress/i, name: "AliExpress" },
  { pattern: /shein/i, name: "Shein" },
  { pattern: /magazineluiza|magalu/i, name: "Magazine Luiza" },
  { pattern: /instagram/i, name: "Instagram" },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function titleFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const segments = pathname.split("/").filter(Boolean);
    // O slug descritivo nem sempre é o último segmento (ex.: Mercado Livre usa
    // /nome-do-produto/p/MLB123456789) — prioriza o segmento com mais palavras.
    const slug =
      [...segments].sort((a, b) => b.split("-").length - a.split("-").length)[0] ?? "";
    const words = slug
      .replace(/\.\w+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b[0-9a-f]{6,}\b/gi, "")
      .replace(/\bMLB\d+\b/gi, "")
      .trim();
    if (!words) return "Produto do anúncio";
    return words
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch {
    return "Produto do anúncio";
  }
}

export function isValidListingUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function fetchMarketplaceListing(url: string): Promise<MarketplaceListing> {
  // Simula a latência de uma busca real.
  await new Promise((resolve) => setTimeout(resolve, 1300));

  const marketplace = MARKETPLACES.find((m) => m.pattern.test(url))?.name ?? "Marketplace";
  const title = titleFromUrl(url);
  const seed = hashString(url);
  const price = 79 + (seed % 3900);
  const shippingCost = seed % 5 === 0 ? 0 : 14 + (seed % 55);

  return {
    marketplace,
    title,
    description: `Anúncio importado do ${marketplace}. Confira os detalhes originais no link antes de confirmar o pedido.`,
    price: Math.round(price),
    shippingCost: Math.round(shippingCost),
  };
}
