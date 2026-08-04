import { NextResponse } from "next/server";
import { fetchMarketplaceListing, isValidListingUrl } from "@/lib/marketplace";

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url?: string };

  if (!url || !isValidListingUrl(url)) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  // TODO: substituir por um serviço real de scraping/parsing (ver lib/marketplace.ts).
  const listing = await fetchMarketplaceListing(url);
  return NextResponse.json({ listing });
}
