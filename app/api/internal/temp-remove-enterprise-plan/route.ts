import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota temporária, de uso único — remove a linha do plano Enterprise em
// produção (a listagem de planos vem do banco, não só do seed). Reaproveita
// CRON_SECRET (já configurado em produção) em vez de exigir uma variável
// nova. Apagar este arquivo logo depois de rodar uma vez.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const plan = await prisma.plan.findUnique({ where: { slug: "enterprise" } });
  if (!plan) {
    return NextResponse.json({ ok: true, alreadyRemoved: true });
  }

  const activeSubscribers = await prisma.sellerSubscription.count({ where: { planId: plan.id } });
  if (activeSubscribers > 0) {
    return NextResponse.json(
      { ok: false, error: "Há vendedores com SellerSubscription no plano Enterprise — não removido.", activeSubscribers },
      { status: 409 }
    );
  }

  await prisma.plan.delete({ where: { slug: "enterprise" } });
  return NextResponse.json({ ok: true, removed: plan });
}
