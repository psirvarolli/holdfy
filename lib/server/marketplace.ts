import "server-only";
import { lookup as dnsLookup } from "node:dns/promises";
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

// Faixas de IPv4 que não são endereço público de verdade — loopback, redes
// privadas, link-local (inclui 169.254.169.254, o endpoint de metadados
// clássico de nuvem AWS/GCP/Azure), CGNAT, multicast e reservado.
const BLOCKED_IPV4_RANGES: [number, number][] = [
  [ipv4ToInt("0.0.0.0"), ipv4ToInt("0.255.255.255")],
  [ipv4ToInt("10.0.0.0"), ipv4ToInt("10.255.255.255")],
  [ipv4ToInt("100.64.0.0"), ipv4ToInt("100.127.255.255")],
  [ipv4ToInt("127.0.0.0"), ipv4ToInt("127.255.255.255")],
  [ipv4ToInt("169.254.0.0"), ipv4ToInt("169.254.255.255")],
  [ipv4ToInt("172.16.0.0"), ipv4ToInt("172.31.255.255")],
  [ipv4ToInt("192.0.0.0"), ipv4ToInt("192.0.0.255")],
  [ipv4ToInt("192.168.0.0"), ipv4ToInt("192.168.255.255")],
  [ipv4ToInt("198.18.0.0"), ipv4ToInt("198.19.255.255")],
  [ipv4ToInt("224.0.0.0"), ipv4ToInt("255.255.255.255")],
];

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => acc * 256 + Number(part), 0);
}

function isBlockedIpv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  return BLOCKED_IPV4_RANGES.some(([start, end]) => value >= start && value <= end);
}

function isBlockedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true; // loopback
  if (normalized.startsWith("fe80:") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true; // link-local
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local (fc00::/7)
  // Endereço IPv4 mapeado em IPv6 (::ffff:a.b.c.d) — confere o IPv4 real por trás.
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIpv4(mapped[1]);
  return false;
}

// Proteção contra SSRF: resolve o host antes de buscar e recusa qualquer
// endereço que não seja claramente público — sem isso, alguém podia colar
// um link tipo http://169.254.169.254/... ou http://localhost:PORT/... e
// fazer o servidor da Holdfy sondar sua própria rede interna (ver auditoria
// de mainnet). Confere de novo pra cada nova URL de redirecionamento (ver
// fetchWithSsrfProtection abaixo) — resolver só a URL original não adianta
// se o servidor de destino redireciona pra um endereço interno depois.
async function assertPublicHost(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new MarketplaceFetchError("Link inválido — use um endereço http(s).");
  }

  let addresses: { address: string; family: number }[];
  try {
    addresses = await dnsLookup(url.hostname, { all: true });
  } catch {
    throw new MarketplaceFetchError("Não consegui resolver esse endereço — confira o link.");
  }

  for (const { address, family } of addresses) {
    const blocked = family === 4 ? isBlockedIpv4(address) : isBlockedIpv6(address);
    if (blocked) {
      throw new MarketplaceFetchError(
        "Esse link não é permitido — preencha os dados manualmente."
      );
    }
  }
}

// redirect: "manual" em vez de deixar o fetch seguir sozinho — um redirect
// pra um endereço interno só apareceria como resposta 3xx aqui, nunca sendo
// buscado sem antes passar por assertPublicHost de novo. Limita a poucos
// saltos pra não virar um jeito de travar a requisição.
async function fetchWithSsrfProtection(startUrl: string, signal: AbortSignal): Promise<Response> {
  let current = new URL(startUrl);
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicHost(current);
    const res = await fetch(current, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      redirect: "manual",
      signal,
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        throw new MarketplaceFetchError("Não consegui acessar esse link — preencha os dados manualmente.");
      }
      current = new URL(location, current);
      continue;
    }
    return res;
  }
  throw new MarketplaceFetchError("Esse link redireciona demais — preencha os dados manualmente.");
}

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
    const res = await fetchWithSsrfProtection(url, controller.signal);
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
