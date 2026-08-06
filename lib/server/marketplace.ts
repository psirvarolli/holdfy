import "server-only";
import * as cheerio from "cheerio";
import {
  detectMarketplaceName,
  detectUnsupportedMarketplace,
  type MarketplaceListing,
} from "@/lib/marketplace";

const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export class MarketplaceFetchError extends Error {}

// Converte "R$ 1.234,56" (formato brasileiro) ou "1234.56" (já numérico, como
// o schema.org pede) para um número. Tenta detectar qual formato é: se tem
// vírgula, assume separador decimal brasileiro; senão, ponto decimal comum.
function parsePrice(raw: string | number | undefined | null): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) && raw > 0 ? raw : null;

  const cleaned = raw.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;

  let normalized: string;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = cleaned;
  }

  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

interface JsonLdProduct {
  name?: string;
  description?: string;
  offers?: { price?: string | number } | { price?: string | number }[];
}

function findJsonLdProduct(json: unknown): JsonLdProduct | null {
  if (!json || typeof json !== "object") return null;
  const node = json as Record<string, unknown>;

  const type = node["@type"];
  const isProduct = type === "Product" || (Array.isArray(type) && type.includes("Product"));
  if (isProduct) return node as JsonLdProduct;

  if (Array.isArray(node["@graph"])) {
    for (const entry of node["@graph"] as unknown[]) {
      const found = findJsonLdProduct(entry);
      if (found) return found;
    }
  }

  return null;
}

function extractFromJsonLd($: cheerio.CheerioAPI): Partial<MarketplaceListing> {
  const scripts = $('script[type="application/ld+json"]').toArray();

  for (const script of scripts) {
    const raw = $(script).text();
    if (!raw?.trim()) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    const candidates = Array.isArray(parsed) ? parsed : [parsed];
    for (const candidate of candidates) {
      const product = findJsonLdProduct(candidate);
      if (!product) continue;

      const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
      const price = parsePrice(offer?.price);

      if (product.name || price) {
        return {
          title: product.name?.trim(),
          description: product.description?.trim(),
          price: price ?? undefined,
        };
      }
    }
  }

  return {};
}

function extractFromMetaTags($: cheerio.CheerioAPI): Partial<MarketplaceListing> {
  const meta = (property: string) =>
    $(`meta[property="${property}"]`).attr("content") ?? $(`meta[name="${property}"]`).attr("content");

  const title = meta("og:title") ?? $("title").first().text();
  const description = meta("og:description");
  const price =
    parsePrice(meta("product:price:amount")) ??
    parsePrice(meta("og:price:amount")) ??
    parsePrice(meta("twitter:data1"));

  return {
    title: title?.trim(),
    description: description?.trim(),
    price: price ?? undefined,
  };
}

export async function fetchMarketplaceListing(url: string): Promise<MarketplaceListing> {
  const unsupported = detectUnsupportedMarketplace(url);
  if (unsupported) {
    throw new MarketplaceFetchError(
      `${unsupported} não permite importação automática de anúncios — preencha os dados manualmente.`
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new MarketplaceFetchError(
        "Não consegui acessar esse link (o site recusou a conexão) — preencha os dados manualmente."
      );
    }
    html = await res.text();
  } catch (error) {
    if (error instanceof MarketplaceFetchError) throw error;
    throw new MarketplaceFetchError(
      "Não consegui buscar os dados desse link — preencha os dados manualmente."
    );
  } finally {
    clearTimeout(timeout);
  }

  const $ = cheerio.load(html);
  const fromJsonLd = extractFromJsonLd($);
  const fromMeta = extractFromMetaTags($);

  const title = fromJsonLd.title || fromMeta.title;
  const description = fromJsonLd.description || fromMeta.description;
  const price = fromJsonLd.price ?? fromMeta.price;

  if (!title || !price) {
    throw new MarketplaceFetchError(
      "Não encontrei o título e o preço na página desse anúncio — preencha os dados manualmente."
    );
  }

  return {
    marketplace: detectMarketplaceName(url),
    title,
    description: description || `Anúncio importado automaticamente. Confira os detalhes originais no link.`,
    price,
    // Frete não vem em nenhuma tag padrão da página — sempre 0 aqui; quem
    // está criando o pedido ajusta na tela se o anúncio tiver frete.
    shippingCost: 0,
  };
}
