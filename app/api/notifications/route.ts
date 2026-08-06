import { NextResponse } from "next/server";
import { listNotifications } from "@/lib/server/notifications";
import { userRole } from "@/lib/server/validation";

export async function GET(request: Request) {
  const roleParam = new URL(request.url).searchParams.get("role");
  const parsed = userRole.safeParse(roleParam);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetro 'role' inválido." }, { status: 400 });
  }

  const notifications = await listNotifications(parsed.data);
  return NextResponse.json({ notifications });
}
