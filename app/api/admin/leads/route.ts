import { NextResponse } from "next/server";
import { listLeads } from "@/lib/server/leads";

// Protegida pelo proxy.ts (matcher /api/admin/:path*) — exige sessão de
// admin válida, diferente da GET pública /api/leads (que só devolve count).
export async function GET() {
  const leads = await listLeads();
  return NextResponse.json({ leads });
}
