import { NextResponse } from "next/server";
import { listNotifications } from "@/lib/server/notifications";
import { getSessionAddress } from "@/lib/server/wallet-session";

// Antes filtrava só por `role` (comprador/vendedor), sem autenticação —
// qualquer um via a atividade de todo mundo naquele papel. Agora exige
// sessão e devolve só as notificações desse endereço específico.
export async function GET(request: Request) {
  const address = await getSessionAddress(request);
  if (!address) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const notifications = await listNotifications(address);
  return NextResponse.json({ notifications });
}
