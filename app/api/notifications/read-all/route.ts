import { NextResponse } from "next/server";
import { markAllNotificationsRead } from "@/lib/server/notifications";
import { parseJsonBody, userRole } from "@/lib/server/validation";
import { z } from "zod";

const schema = z.object({ role: userRole });

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, schema);
  if ("error" in parsed) return parsed.error;

  await markAllNotificationsRead(parsed.data.role);
  return NextResponse.json({ ok: true });
}
