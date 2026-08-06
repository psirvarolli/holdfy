import { NextResponse } from "next/server";
import { listPlans } from "@/lib/server/plans";

// Lista pública dos planos — só os dados que fazem sentido mostrar a quem
// está escolhendo um plano (sem a margem/custo interno da Holdfy).
export async function GET() {
  const plans = await listPlans();
  return NextResponse.json({ plans });
}
