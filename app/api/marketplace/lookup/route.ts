import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchMarketplaceListing, MarketplaceFetchError } from "@/lib/server/marketplace";
import { parseJsonBody } from "@/lib/server/validation";

const schema = z.object({ url: z.string().url() });

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const listing = await fetchMarketplaceListing(parsed.data.url);
    return NextResponse.json({ listing });
  } catch (error) {
    const message =
      error instanceof MarketplaceFetchError
        ? error.message
        : "Não consegui buscar os dados desse link — preencha os dados manualmente.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
