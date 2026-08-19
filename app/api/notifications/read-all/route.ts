import { NextResponse } from "next/server";
import { markAllNotificationsRead } from "@/lib/server/notifications";
import { getSessionAddress } from "@/lib/server/wallet-session";

export async function POST(request: Request) {
  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await markAllNotificationsRead(address);
  return NextResponse.json({ ok: true });
}
