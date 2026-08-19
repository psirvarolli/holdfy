import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchMarketplaceListing, MarketplaceFetchError } from "@/lib/server/marketplace";
import { parseJsonBody } from "@/lib/server/validation";
import { isRateLimited } from "@/lib/server/rate-limit";

const schema = z.object({ url: z.string().url() });
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutos

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await isRateLimited(`marketplace-lookup:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo." },
      { status: 429 }
    );
  }

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
