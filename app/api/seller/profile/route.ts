import { NextResponse } from "next/server";
import { z } from "zod";
import { getSellerProfile, saveMonthlyRevenue } from "@/lib/server/seller-profile";
import { parseJsonBody, money } from "@/lib/server/validation";
import { getSessionAddress } from "@/lib/server/wallet-session";

// Diferente de /api/seller/whatsapp, aqui não existe um caso de uso público
// (nenhum bot precisa resolver faturamento por endereço) — GET e POST exigem
// sessão verificada dos dois lados, sempre lendo/gravando o próprio vendedor.
export async function GET(request: Request) {
  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const profile = await getSellerProfile(address);
  return NextResponse.json({ profile });
}

const saveSchema = z.object({ monthlyRevenueReais: money.nonnegative() });

export async function POST(request: Request) {
  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, saveSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const profile = await saveMonthlyRevenue(address, parsed.data.monthlyRevenueReais);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Falha ao salvar o faturamento mensal", error);
    return NextResponse.json({ error: "Falha ao salvar. Tente novamente." }, { status: 500 });
  }
}
