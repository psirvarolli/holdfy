import { NextResponse } from "next/server";
import { getSellerPlanStatus } from "@/lib/server/plans";
import { stellarAddress } from "@/lib/server/validation";

export async function GET(request: Request) {
  const sellerAddress = new URL(request.url).searchParams.get("sellerAddress");
  const parsed = stellarAddress.safeParse(sellerAddress);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetro 'sellerAddress' inválido." }, { status: 400 });
  }

  const status = await getSellerPlanStatus(parsed.data);
  return NextResponse.json({ status });
}
