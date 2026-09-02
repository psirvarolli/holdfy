import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota temporária, de uso único — aplica a migration 20260902210135 (tabela
// SellerProfile) em produção antes do deploy do código que depende dela.
// Reaproveita CRON_SECRET (já configurado em produção). Apagar este arquivo
// logo depois de rodar uma vez.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SellerProfile" (
      "id" TEXT NOT NULL,
      "sellerAddress" TEXT NOT NULL,
      "monthlyRevenueReais" DOUBLE PRECISION NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "SellerProfile_sellerAddress_key" ON "SellerProfile"("sellerAddress")
  `);

  return NextResponse.json({ ok: true });
}
