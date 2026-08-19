import { NextResponse } from "next/server";
import { markNotificationRead } from "@/lib/server/notifications";
import { getSessionAddress } from "@/lib/server/wallet-session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await markNotificationRead(id, address);
  return NextResponse.json({ ok: true });
}
